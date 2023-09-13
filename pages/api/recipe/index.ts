import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../utils/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { slug } = req.body;
        const client = await clientPromise;
        const db = client.db("what-to-eat");
        const recipe = await db.collection('recipes').findOne({ slug: slug });

        if (recipe) {
            res.status(400).json({ message: 'slug exists' });
        } else {
            const id = 'MD' + Math.random().toString(36).slice(2) + Date.now().toString(36)
            await db.collection('recipes').insertOne({
                ...req.body,
                created: new Date().toISOString(),
            });
            res.status(200).json({ id });
        }
    } catch (e) {
        res.status(400).json({ message: e });
    }
}