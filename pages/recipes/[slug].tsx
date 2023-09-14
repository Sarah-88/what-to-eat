import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router'
import clientPromise from '../../utils/db';
import { Recipe } from '../../utils/types';
import { Carter_One } from '@next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { storage } from '../../firebaseConfig';
import { getBlob, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';

const carter = Carter_One({ weight: "400", variable: '--font-carter', display: 'swap' })

const SingleRecipe: React.FC<{ recipe: Recipe }> = (props) => {
    const { recipe } = props
    const router = useRouter()
    const [img, setImg] = useState<string>('')

    useEffect(() => {
        const getImg = async () => {
            const storageRef = ref(storage, `recipe/${recipe.id}`)
            const img = await getBlob(storageRef)
            setImg(URL.createObjectURL(img))
        }
        getImg()
    }, [])

    if (router.isFallback) {
        return (
            <div>loading</div>
        )
    } else {
        if (recipe) {
            return (
                <div className="max-w-4xl p-10 m-auto mt-5">
                    <h1 className={`text-center text-4xl ${carter.className}`}>{recipe.title}</h1>
                    <h4 className="text-right italic mt-8">Added {new Date(recipe.created).toDateString()}</h4>
                    <div className="mt-3 h-80 overflow-hidden rounded-2xl bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(${img})` }}></div>
                    <div className="grid grid-cols-[1fr_2fr] gap-4 mt-5">
                        <label>Cuisine</label>
                        <p>{recipe.cuisine}</p>
                        <label>Categories</label>
                        <div>
                            {recipe.categories.map((cat, i) => <span key={`cat-${i}`} className="rounded pl-1 pr-1 text-sm text-white bg-orange-600 mr-1">{cat}</span>)}
                        </div>
                        {recipe.recipeUrl && (<>
                            <label>Preparation Time</label>
                            <p>{recipe.prepTime} minutes</p>
                            <label>Cooking Time</label>
                            <p>{recipe.cookTime} minutes</p>
                            <label>URL</label>
                            <p><Link href={recipe.recipeUrl} target="_blank" rel="noreferrer noopener" className="theme-color">Link</Link></p>
                        </>)}
                        <label>Where to buy</label>
                        <p><Link href={`https://www.google.com/maps/search/${encodeURIComponent(recipe.title + ' near me')}/`} target="_blank" rel="noreferrer noopener" className="theme-color">Link</Link></p>
                    </div>
                </div>
            );
        } else {
            return (
                <div>not found</div>
            )
        }
    }
};

export const getStaticPaths = async () => {
    const client = await clientPromise;
    const db = client.db("what-to-eat");
    const query = db.collection("recipes").find({})
    const recipes = await query.toArray()
    const paths = recipes.map(recipe => ({
        params: {
            slug: recipe.slug
        }
    }));
    return {
        paths,
        fallback: true
    }
}

export const getStaticProps = async (context: GetStaticPropsContext<{ slug: string }>) => {
    const { slug } = context.params!;
    const client = await clientPromise;
    const db = client.db("what-to-eat");
    const recipe = await db.collection("recipes").findOne({ slug: slug })
    if (recipe) {
        const { _id, ...rest } = recipe
        return {
            props: {
                recipe: rest
            }
        }
    } else {
        return {
            props: {}
        }
    }
}

export default SingleRecipe;