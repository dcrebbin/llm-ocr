export async function POST(req: Request) {
  const { image, model } = await req.json();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcribe the image and convert it into markdown that maintain the original formatting of the image.",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    }),
  }).catch((e) => {
    console.error(e);
    return Response.json(e);
  });
  const data = await response.json();
  if (data?.choices[0]?.message?.content) {
    return Response.json(data.choices[0].message.content);
  }
  return Response.json(data);
}
