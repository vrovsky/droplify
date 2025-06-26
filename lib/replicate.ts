export async function enhanceImage(inputUrl: string): Promise<string> {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "real-esrgan-model-id",
      input: { image: inputUrl },
    }),
  });

  const data = await response.json();
  return data?.urls?.get; // Ссылка на готовый результат
}
