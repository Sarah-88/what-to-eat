import Link from 'next/link'
import { Recipe } from '../utils/types';
import Image from 'next/image';
import { storage } from '../firebaseConfig';
import { getBlob, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';

const fill = async (id: string) => {
    const storageRef = ref(storage, `recipe/${id}`)
    const img = await getBlob(storageRef)
    return URL.createObjectURL(img)
}

export const RecipeBox: React.FC<{ recipesData: Recipe[] }> = (props) => {
    const { recipesData } = props;
    const [images, setImages] = useState<string[]>([])
    useEffect(() => {
        const loadImage = async () => {
            let img: string[] = []
            for (let i = 0; i < recipesData.length; i++) {
                img.push(await fill(recipesData[i].id!))
            }
            setImages(img)
        }
        loadImage()
    }, [recipesData])
    return (
        <>
            {recipesData?.map((recipe, idx) => (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="rounded-lg overflow-hidden block bg-gray-400/50">
                    {images[idx] ? <Image
                        src={images[idx]}
                        alt={recipe.title}
                        width={340}
                        height={220}
                        className="w-full"
                        loading="lazy"
                    /> : <div className="aspect-square w-full bg-slate-400/25 flex justify-center items-center">
                        <div className="w-10 aspect-square bg-slate-50/50 animate-pulse rounded-lg"></div>
                    </div>}
                    <p className="p-5 text-lg">
                        {recipe.title}
                    </p>
                </Link>
            ))}
        </>
    );
};