import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { searchSimilarContent } from "../../../../lib/services/vectorSearchService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid knowledge ID is required" });
  }

  // Only allow POST method for test queries
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Verify knowledge exists
    const knowledge = await prisma.knowledge.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!knowledge) {
      return res.status(404).json({ error: "Knowledge item not found" });
    }

    // Get query and test parameters from request
    const { query, limit = 5, threshold = 0.7 } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Valid query string is required" });
    }

    // Perform vector search against this knowledge base
    const results = await searchSimilarContent(query, {
      knowledgeId: id,
      limit: Number(limit),
      similarityThreshold: Number(threshold)
    });

    // Return results with test metadata
    return res.status(200).json({
      query,
      knowledgeId: id,
      timestamp: new Date().toISOString(),
      parameters: {
        limit: Number(limit),
        threshold: Number(threshold)
      },
      results: results
    });
  } catch (error) {
    console.error("Retrieval test error:", error);
    return res.status(500).json({ error: "Error performing retrieval test" });
  }
}
