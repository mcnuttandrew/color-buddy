import { MongoClient } from "mongodb";
import type { Context } from "@netlify/functions";

export function errorResponse(err: string) {
  console.error(err);
  return Response.json({ error: err }, { status: 500 });
}
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017";
const DB_NAME = "color-buddy-analytics";

export default async (req: Request, context: Context) => {
  let eventLog;
  const body: string = await req.text();
  try {
    eventLog = JSON.parse(body || "");
    eventLog = { ...eventLog, country: context.geo?.country || "unknown" };
  } catch (e) {
    return errorResponse("Bad submit");
  }
  console.log(eventLog);
  return MongoClient.connect(`${DB_URL}/${DB_NAME}`)
    .then((connection) => {
      const db = connection.db(DB_NAME);
      const collection = db.collection("analytics");

      return collection
        .insertOne({ ...eventLog, createdAt: new Date() })
        .then(() => {
          connection.close();
          return Response.json({ status: "success" }, { status: 200 });
        })
        .catch((err) => errorResponse(err));
    })
    .catch((err) => errorResponse(err));
};
