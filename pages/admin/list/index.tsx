import { useEffect, useState } from 'react';
import Link from 'next/link'
import axios from 'axios';
import { Recipe } from '../../../utils/types';

const List = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    const setData = async () => {
      const res = await axios.get('/api/recipes');
      setRecipes(res.data.recipesData);
    }
    setData();
  }, []);

  return (
    <div>
      <h1>Recipes</h1>
      {recipes.map(recipe => (
        <div key={recipe.id}>
          <Link href={`/admin/list/${recipe.id}`}>
            {recipe.title}
          </Link>
          <br/>
        </div>
      ))}
    </div>
  );
};

export default List;