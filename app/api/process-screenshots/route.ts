import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCalendarLinkPrompt } from '../../lib/prompt';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey
});

export async function POST(request: Request) {
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
            console.log(`\n🔗 Link ${index + 1} analysis:`, {
              fullUrl: link,
              parameters: {
                text: url.searchParams.get('text'),
                dates: url.searchParams.get('dates'),
                timezone: url.searchParams.get('ctz'),
                details: url.searchParams.get('details'),
                location: url.searchParams.get('location')
              }
            });
          } catch (urlError) {
            console.error(`❌ Invalid URL in link ${index + 1}:`, link);
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