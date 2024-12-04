import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCalendarLinkPrompt } from '../../lib/prompt';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY is not defined in environment variables');
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
} else {
  console.log('OPENAI_API_KEY is set successfully');
}

const openai = new OpenAI({
  apiKey: apiKey
});

function formatDateTime(dateString: string) {
  try {
    // Extract components from UTC string format YYYYMMDDTHHmmSSZ
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hour = dateString.slice(9, 11);
    const minute = dateString.slice(11, 13);

    // Create readable format
    const date = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    ));

    return {
      utc: `${year}-${month}-${day} ${hour}:${minute} UTC`,
      local: date.toLocaleString(),
      components: {
        year, month, day, hour, minute
      }
    };
  } catch (error) {
    return null;
  }
}

// Add this helper function
function incrementUTCDate(utcString: string): string {
  // Format: YYYYMMDDTHHmmSSZ
  const year = parseInt(utcString.slice(0, 4));
  const month = parseInt(utcString.slice(4, 6)) - 1; // 0-based month
  const day = parseInt(utcString.slice(6, 8));
  const time = utcString.slice(9); // Keep the time portion

  const date = new Date(Date.UTC(year, month, day));
  date.setUTCDate(date.getUTCDate() + 1); // Add one day

  const newDateString = date.toISOString()
    .slice(0, 10)
    .replace(/-/g, '');

  return `${newDateString}T${time}`;
}

export async function POST(request: Request) {
  // Add CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  try {
    console.log('\n🚀 Starting process-screenshots endpoint');
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const timezone = formData.get('timezone') as string;
    
    console.log('\n📁 Files received:', {
      count: files.length,
      timezone: timezone,
      fileDetails: files.map(f => ({
        name: f.name,
        type: f.type,
        size: `${(f.size / 1024).toFixed(2)} KB`
      }))
    });

    // Convert files to base64
    console.log('\n🔄 Converting files to base64...');
    const base64Images = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return `data:${file.type};base64,${base64}`;
      })
    );
    console.log('✅ Converted', base64Images.length, 'images to base64');

    const imageContent = base64Images.map(image => ({
      type: "image_url" as const,
      image_url: { url: image }
    }));

    // Prepare OpenAI request
    console.log('\n🤖 Preparing OpenAI request...');
    const prompt = getCalendarLinkPrompt(timezone);
    console.log('\n📝 Prompt being used:', prompt);

    // Make OpenAI request
    console.log('\n📡 Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageContent
          ]
        }
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    console.log('\n✨ Raw OpenAI response:', response.choices[0].message.content);
    
    // Parse response with detailed error handling
    let result;
    try {
      const rawContent = response.choices[0].message.content || '{}';
      console.log('\n🔍 Attempting to parse JSON:', rawContent);
      
      result = JSON.parse(rawContent);
      
      // Validate the structure of the result
      console.log('\n📊 Parsed result structure:', {
        hasLinksProperty: 'links' in result,
        linksType: Array.isArray(result.links) ? 'array' : typeof result.links,
        numberOfLinks: result.links?.length || 0
      });

      // Analyze each link
      if (result.links && Array.isArray(result.links)) {
        result.links.forEach((link: string, index: number) => {
          try {
            const url = new URL(link);
            const dates = url.searchParams.get('dates')?.split('/');
            
            if (dates && dates.length === 2) {
              const [startUTC, endUTC] = dates;
              
              // Check if start is after end
              if (startUTC > endUTC) {
                console.log('\n⚠️ Time Sequence Issue Detected:');
                console.log('Original UTC Start:', startUTC);
                console.log('Original UTC End:', endUTC);
                
                // Fix the end date
                const correctedEndUTC = incrementUTCDate(endUTC);
                console.log('Corrected UTC End:', correctedEndUTC);
                
                // Update the URL with corrected dates
                url.searchParams.set('dates', `${startUTC}/${correctedEndUTC}`);
                
                // Log the correction
                console.log('✅ Date Correction Applied');
              }

              const startFormatted = formatDateTime(startUTC);
              const endFormatted = formatDateTime(url.searchParams.get('dates')?.split('/')[1] || endUTC);

              console.log(`\n📅 Calendar Event ${index + 1} Details:`);
              console.log('Title:', decodeURIComponent(url.searchParams.get('text') || ''));
              
              console.log('\nStart Time:');
              console.log('  UTC:', startFormatted?.utc);
              console.log('  Local:', startFormatted?.local);
              
              console.log('\nEnd Time:');
              console.log('  UTC:', endFormatted?.utc);
              console.log('  Local:', endFormatted?.local);

              // Ensure finalDates is defined before accessing
              const finalDates = url.searchParams.get('dates')?.split('/');
              if (finalDates && finalDates.length === 2) {
                console.log('  Start < End:', finalDates[0] < finalDates[1] ? 'Valid' : 'Invalid');
                console.log('  Same Day:', finalDates[0].slice(0, 8) === finalDates[1].slice(0, 8) ? 'Yes' : 'No');
              } else {
                console.log('❌ Invalid date format in finalDates:', finalDates);
              }

              console.log('\nRaw Parameters:');
              console.log('  Timezone:', url.searchParams.get('ctz'));
              console.log('  Final UTC String:', url.searchParams.get('dates'));

              return url.toString();
            }
            return link;
          } catch (urlError) {
            console.error(`❌ Error analyzing link ${index + 1}:`, urlError);
            return link;
          }
        });
      }

    } catch (parseError) {
      console.error('\n❌ Error parsing OpenAI response:', {
        error: parseError as Error,
        rawContent: response.choices[0].message.content,
        errorType: (parseError as Error).name,
        errorMessage: (parseError as Error).message
      });
      return NextResponse.json({ success: false, error: 'Failed to parse OpenAI response' }, { status: 500 });
    }

    // Log final result
    console.log('\n🎉 Processing complete! Final result:', {
      success: true,
      numberOfLinks: result.links?.length || 0,
      links: result.links || []
    });
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('\n💥 Error in process-screenshots:', {
      error: error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process images' 
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  const response = new NextResponse(null, {
    status: 200,
  });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}