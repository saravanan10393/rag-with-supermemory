import supermemory from "supermemory";

const client = new supermemory({
  apiKey: process.env["SUPERMEMORY_API_KEY"], // This is the default and can be omitted
});

export async function queryDB(query: string, userId: string) {
  const response = await client.search.execute({
    q: query,
    containerTags: [userId, "Product List"],
  });
  console.log("Fetched from memory", response.results);
  return response.results;
}

export async function addToDB(text: string, userId: string) {
  const params: supermemory.MemoryAddParams = {
    content: text,
    containerTags: [userId, "Product List"],
  };
  console.log("adding text to memoery ", text);
  const response: supermemory.MemoryAddResponse | void = await client.memories
    .add(params)
    .catch((error) => {
      console.error("Failed add to memory", error);
    });
  console.log(response);
  return response;
}
