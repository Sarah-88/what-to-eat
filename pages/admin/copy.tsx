import React, { useState } from 'react';
import dashify from 'dashify';
import axios from 'axios';
import { Recipe } from '../../utils/types';
import { Montserrat } from '@next/font/google';
import countries from '../../utils/countries';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, uploadString } from 'firebase/storage';
import {findCategory, fullCategories, getCategoriesDropdown} from '../../utils/categories';

const montserrat = Montserrat({subsets: ['latin'], variable: '--font-montserrat', display: 'swap'})
function delay(num: number) {
  return new Promise(res => setTimeout(res, num*1000));
}

const CopyRecipe: React.FC = () => {
  const [start, setStart] = useState(0);
  const [num, setNum] = useState(0);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value, name } = e.target;
    if (name === 'start') {
        setStart(Number(value));
    } else {
        setNum(Number(value));
    }
  }

  const grabData = async (start: number) => {
    try {
      const grab = await axios.get(`https://rasamalaysia.com/wp-json/mv-create/v1/creations/${start}/`);
      console.log(grab.data);
      const title = grab.data.title.replace(/\([^)]+\)/, '').replace(/(recipes?)|(easy)|(how to make)/i, '').trim();
      const cat = grab.data.category_name.replace(/recipes/i, '').trim();
      const secondCat = grab.data.secondary_term_name.replace(/recipes/i,'').trim();
      let cuisine = '';
      if (fullCategories.Cuisine.includes(cat)) {
        cuisine = cat;
      } else if (fullCategories.Cuisine.includes(secondCat)) {
        cuisine = secondCat;
      } else if (["American", "English", "Australian"].includes(cat) || ["American", "English", "Australian"].includes(secondCat)) {
        cuisine = "Western";
      } else if (title.toLowerCase().includes('cake') || title.toLowerCase().includes('cookie')) {
        cuisine = "Western";
      } else {
        cuisine = prompt(`"${title}" is missing cuisine. Enter Missing Cuisine from the following list (${fullCategories.Cuisine.join(', ')}):`) || ''
      }
      let category = findCategory(cat, title);
      if (title.toLowerCase().includes(' roll')) {
        category.push('Bread');
      }
      if (title.toLowerCase().includes('soup')) {
        category.push('Soup');
      }
      if (title.toLowerCase().includes('spicy')) {
        category.push('Chili');
      }
      if (title.toLowerCase().includes('cheesy')) {
        category.push('Cheese');
      }
      if (title.toLowerCase().includes('bacon') && !category.includes('Pork')) {
        category.push('Pork');
        if (!category.includes('Meat')) {
          category.push('Meat');
        }
      }
      if (title.toLowerCase().includes('wings') && !category.includes('Chicken')) {
        category.push('Chicken');
        if (!category.includes('Meat')) {
          category.push('Meat');
        }
      }
      if (title.toLowerCase().includes('cake') || title.toLowerCase().includes('tart')) {
        category.push("Desserts");
        if (title.toLowerCase().includes('tart')) {
          category.push("Pastry");
        }
      } else if (title.toLowerCase().includes('cookie') || title.toLowerCase().includes('puffs')) {
        category.push("Snacks");
      } else if (title.toLowerCase().includes('parmesan')) {
        category.push("Cheese");
      } else if (category.length === 0) {
        const askCat = prompt(`"${title}" is missing category. Enter comma separated list of categories:`);
        category = askCat ? askCat.split(',') : [];
      }
      const content: Recipe = {
        slug: dashify(title),
        title: title,
        categories: category,
        cuisine: cuisine,
        prepTime: Number(grab.data.prep_time)/60,
        cookTime: Number(grab.data.active_time)/60,
        created: new Date().toISOString(),
        recipeUrl: grab.data.canonical_post_permalink
      }
      const thumbnail = grab.data.thumbnail_uri;
      const nextId = grab.data.links.next.id;
      const imgFile = await fetch(thumbnail);
      const imgBlob = await imgFile.blob();
      console.log('parsed', content, thumbnail, nextId);
      const resp = await axios.post(`/api/recipe`, content);
      if (resp.data.id) {
          const storageRef = ref(storage, `recipe/${resp.data.id}`);
          uploadBytes(storageRef, imgBlob).then((snapshot) => {
              console.log('Uploaded a blob or file!', snapshot);
          });
          console.log(`http://localhost:3000/admin/list/${resp.data.id}`);
      }
      return Number(nextId);
    } catch (e) {
      console.log('failed to fetch', e);
      return start + 1;
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(start > 0 && num > 0)) {
        return;
    }
    let currId = start;
    for (let i = 0; i < num; i++) {
      currId = await grabData(currId);
      await delay(5);
    }
    console.log('completed');
  }

  return (
    <div className="p-5 max-w-3xl m-auto">
      <h2 className={`font-bold text-xl text-center ${montserrat.className}`}>Grab Recipe</h2>
      <form action="/recipe" onSubmit={onSubmit} method="POST" className="grid grid-cols-[200px_1fr] gap-2 mt-5">
        <label className="p-2">Start Number</label>
        <input type="number" name="start" className="p-2" onChange={onChange} />
        <label className="p-2">Amount</label>
        <input type="number" name="num" className="p-2" onChange={onChange} />
        <button
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CopyRecipe;