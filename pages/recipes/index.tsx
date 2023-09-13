import { getBlob, ref } from 'firebase/storage';
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { storage } from '../../firebaseConfig';
import { Recipe } from '../../utils/types';
import clientPromise from '../../utils/db';
import Image from 'next/image';
import { Carter_One } from '@next/font/google';
import dynamic from 'next/dynamic';

const carter = Carter_One({ weight: "400", variable: '--font-carter', display: 'swap' })

function chunk<T>(array: T[], chunkSize: number) {
    const length = Math.ceil(array.length / chunkSize)
    const chunks = new Array(length).fill(0);
    return chunks.map((_, index) => {
        const start = index * chunkSize;
        const end = (index + 1) * chunkSize;
        return array.slice(start, end);
    })
}

const RecipeBoxes = dynamic<{ recipesData: Recipe[] }>(() => import('../../components/recipebox').then(rec => rec.RecipeBox), {})

const Recipes = (props: { recipesData: Recipe[][] }) => {
    const { recipesData } = props;
    const [currPage, setCurrPage] = useState(0)
    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY + window.innerHeight + 800 >= document.body.clientHeight) {
                setCurrPage((prevState) => prevState + 1)
            }
        };
        window.addEventListener("scroll", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);
    return (
        <div className="max-w-6xl m-auto mt-10 p-10">
            <h1 className={`text-3xl text-center mb-5 ${carter.className}`}>Recipes</h1>
            <div className="grid grid-cols-3 gap-6">
                {recipesData?.filter((rec, i) => currPage >= i).map((recipeChunk, idx) => (
                    <RecipeBoxes recipesData={recipeChunk} />
                ))}
            </div>
        </div>
    );
};

export const getStaticProps = async () => {
    const client = await clientPromise;
    const db = client.db("what-to-eat");
    const recipeQuery = db.collection('recipes').find({}).project({ _id: 0 }).sort('created', -1)
    const recipesData = await recipeQuery.toArray()
    return {
        props: { recipesData: chunk(recipesData, 20) },
        revalidate: 10
    }
}

export default Recipes;