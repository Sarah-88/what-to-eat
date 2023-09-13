// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../utils/db';

type Data = {
  name: string
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const batch = db.batch();
    let query = db.collection('recipes');
    const recipes = await query.orderBy('created').get();
    let counter = 1;
    recipes.docs.forEach(recipe => {
      const docRef = db.collection("recipes").doc(recipe.id);
      batch.update(docRef, {internalId: counter});
      counter++;
    });
    await batch.commit();
    res.status(200).json({ message: `Success updated ${recipes.docs.length} items` });
  } catch (e) {
    res.status(400).json({message: e, req: req.body});
  }
}
