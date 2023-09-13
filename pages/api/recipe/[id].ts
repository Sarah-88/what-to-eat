import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../utils/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;

    try {
        const client = await clientPromise;
        const db = client.db("what-to-eat");
        if (req.method === 'PUT') {
            await db.collection('recipes').updateOne({ id: id }, {
                ...req.body,
                updated: new Date().toISOString(),
            });
        } else if (req.method === 'GET') {
            const doc = await db.collection('recipes').findOne({ id: id });
            if (!doc) {
                res.status(404).end();
            } else {
                res.status(200).json(doc);
            }
        } else if (req.method === 'DELETE') {
            await db.collection('recipes').deleteOne({ id: id });
        }
        res.status(200).end();
    } catch (e) {
        res.status(400).end();
    }
}