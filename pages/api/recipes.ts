import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../utils/db';
import admin from 'firebase-admin';
import { Recipe } from '../../utils/types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let msg: string[][] = [];
    try {
        const body = req.body;
        let query: any = db.collection('recipes');
        const key = query.doc().id;
        if (body?.filters) {
            body.filters.forEach((r: { field: string, condition: any, value: any }) => {
                msg.push([r.field, r.condition, r.value]);
                query = query.where(r.field, r.condition, r.value);
            })
        }
        let recipes: admin.firestore.QuerySnapshot;
        let recipesData: (Recipe & { id: string })[] = [];
        const limit = body?.limit ?? 20;
        if (body?.randomize) {
            msg.push(['key', key]);
            recipes = await query.where(admin.firestore.FieldPath.documentId(), '>', key).orderBy(admin.firestore.FieldPath.documentId()).limit(limit).get();
            if (recipes.docs?.length > 0) {
                recipesData = recipes.docs.map(recipe => ({
                    id: recipe.id,
                    ...recipe.data() as Recipe
                }));
            }
            if (recipes.docs?.length < limit) {
                recipes = await query.where(admin.firestore.FieldPath.documentId(), '<', key).orderBy(admin.firestore.FieldPath.documentId()).limit(limit).get();
                recipesData = recipesData.concat(recipes.docs.map(recipe => ({
                    id: recipe.id,
                    ...recipe.data() as Recipe
                })));
            }
        } else {
            recipes = await query.limit(limit).get();
            recipesData = recipes.docs.map(recipe => ({
                id: recipe.id,
                ...recipe.data() as Recipe
            }));
        }

        res.status(200).json({ recipesData, logs: msg });
    } catch (e) {
        console.log('error!', e);
        res.status(400).json({ message: e, req: req.body, logs: msg });
    }
}