import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../utils/db';
import { Recipe } from '../../utils/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const body = req.body;
        const client = await clientPromise;
        const db = client.db("what-to-eat");
        let match: { [key: string]: any } = {};
        if (body?.filters) {
            body.filters.forEach((r: { field: string, condition: any, value: any }) => {
                match[r.field] = r.condition === 'in' ? { $in: r.value } : r.value;
            })
        }
        let recipesData: (Recipe & { id: string })[] = [];
        const limit = body?.limit ?? 20;
        if (body?.randomize) {
            const query = db.collection('recipes').aggregate<Recipe & { id: string }>([{ $match: match }, { $sample: { size: limit } }])
            recipesData = await query.toArray()
        } else {
            const query = db.collection('recipes').aggregate<Recipe & { id: string }>([{ $match: match }, { $limit: limit }])
            recipesData = await query.toArray()
        }

        res.status(200).json({ recipesData });
    } catch (e) {
        console.log('error!', e);
        res.status(400).json({ message: e, req: req.body });
    }
}