import { getBlob, ref } from 'firebase/storage';
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react';
import { storage } from '../../firebaseConfig';
import db from '../../utils/db';
import { Recipe } from '../../utils/types';
import recipes from '../api/recipes';

const Recipes: React.FC<{recipesData: Recipe[]}> = (props) => {
  const { recipesData } = props;
  const [recipesList, setRecipesList] = useState<(Recipe & {image: string})[]>([]);
  useEffect(() => {
    const fill = async() => {
      let data: (Recipe & {image: string})[] = [];
      for (let i = 0; i < recipesData.length; i++) {
        const storageRef = ref(storage, `recipe/${recipesData[i].id}`);
        const img = await getBlob(storageRef);
        console.log('heres the image', img);
        data[i] = {
          ...recipesData[i],
          image: URL.createObjectURL(img)
        }
      }
      console.log('done', data);
      setRecipesList(data);
    }
    fill();
  }, []);
  useEffect(() => {
    console.log('has updated?', recipesList);
  }, [recipesList])
  return (
    <div>
      <h1>Recipes</h1>
      {recipesList?.map(recipe => (
        <div key={recipe.id}>
          <Link href={`/recipes/${recipe.slug}`}>
            <span>{recipe.title}</span>
          </Link>
          <img src={recipe.image} />
          <br />
        </div>
      ))}
    </div>
  );
};

export const getStaticProps = async () => {
  const recipes = await db.collection('recipes').orderBy('created', 'desc').get();
  
  let recipesData = recipes.docs.map(recipe => {
    return {
      id: recipe.id,
      ...recipe.data()
    }
  });
  return {
    props: { recipesData },
    revalidate: 10
  }
}

export default Recipes;