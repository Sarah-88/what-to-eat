import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { slug } = req.body;
    const recipe = await db.collection('recipes').where('slug', '==', slug).limit(1).get();

    if (recipe.docs?.length) {
      res.status(400).json({message: 'slug exists'});
    } else {
      const { id } = await db.collection('recipes').add({
        ...req.body,
        created: new Date().toISOString(),
      });
      res.status(200).json({ id });
    }
  } catch (e) {
    res.status(400).json({message: e});
  }
}