import Head from 'next/head'
import Image from 'next/image'
import { Montserrat, Carter_One } from '@next/font/google'
import styles from '../styles/main.module.css'
import React, { useEffect } from 'react'
import { Recipe } from '../utils/types'
import axios from 'axios'
import { storage } from '../firebaseConfig'
import { getBlob, ref } from 'firebase/storage'
import { Icons } from '../utils/icons'
import { fullCategories, getParentCat } from '../utils/categories'
import CategorySelect from '../components/CategorySelect'
//import chicken from '../icons/chicken-leg-chicken-svgrepo-com.svg'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const carter = Carter_One({ weight: "400", variable: '--font-carter', display: 'swap' })
const getRecipes: (cuisine: string[], category?: string[]) => Promise<Recipe[]> = async (cuisine, category) => {
    let fields = [{ field: 'cuisine', condition: 'in', value: cuisine }];
    if (category?.length) {
        fields.push({ field: 'categories', condition: 'in', value: category });
    }
    const res = await axios.post('/api/recipes', { filters: fields, limit: 1, randomize: true });
    return res.data.recipesData;
}
const cardWidth = 240;

export default function Home() {
    const cards = Array(19).fill(false);
    const [chosenCard, setChosenCard] = React.useState<(Recipe & { image: string, reset: boolean }) | undefined>();
    const [chosenIdx, setChosenIdx] = React.useState(-1);
    const [flip, setFlip] = React.useState(false);
    const [category, setCategory] = React.useState({
        cuisine: ["Malaysian", "Chinese", "Indian", "Asian", "Western"],
        meat: [],
        seafood: [],
        vegetables: [],
        staples: []
    });
    const catList = [
        { name: 'cuisine', title: 'What piques your fancy?', list: fullCategories.Cuisine },
        { name: 'meat', title: 'Some meaty goodness...', list: fullCategories.Meat },
        { name: 'seafood', title: 'Maybe some alternate proteins?', list: fullCategories.Seafood },
        { name: 'vegetables', title: 'Eating healthy?', list: fullCategories.Vegetables },
        { name: 'staples', title: 'Need some carbs?', list: fullCategories.Staples }
    ];
    const [catPage, setCatPage] = React.useState(0);

    const resetShare = React.useCallback(() => {
        setFlip(false);
        setChosenCard((prevState) => (prevState ? { ...prevState, reset: true } : undefined));
        setTimeout(() => {
            setChosenIdx(-1);
        }, 300);
        setTimeout(() => {
            setChosenCard(undefined);
        }, 800);
    }, []);
    const changeCat = React.useCallback(() => {
        resetShare();
        setTimeout(() => {
            setCatPage(0);
        }, 1600);
    }, [setCategory]);
    const getRec = React.useCallback(async () => {
        const rc = await getRecipes(category.cuisine, category.meat.concat(category.seafood, category.vegetables, category.staples));
        let data = {} as (Recipe & { image: string, reset: boolean });
        const storageRef = ref(storage, `recipe/${rc[0].id}`);
        const img = await getBlob(storageRef);
        data = {
            ...rc[0],
            image: URL.createObjectURL(img),
            reset: false
        }
        setChosenCard(data);
        setTimeout(() => {
            setChosenIdx(Math.floor(Math.random() * 19));
            setTimeout(() => {
                setFlip(true);
            }, 400);
        }, 5800);
    }, [category, setCategory]);
    const reset = React.useCallback(() => {
        resetShare();
        setTimeout(() => {
            getRec();
        }, 1600);
    }, [getRec]);
    return (
        <>
            <Head>
                <title>What to eat?</title>
                <meta name="description" content="Helps you decide what to eat" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="text-center p-3">
                <h1 className={`text-4xl mt-5 ${carter.className} theme-color font-sans`}>What to eat today?</h1>
                {chosenIdx > -1 &&
                    <div className="ml-auto mr-auto mt-3 flex max-w-3xl justify-center">
                        <button type="button" className="border-theme-color border p-2 rounded text-sm m-1" onClick={reset}>Suggest Others</button>
                        <button type="button" className="border-theme-color border p-2 rounded text-sm m-1" onClick={changeCat}>Change Category</button>
                    </div>
                }
                <div className={`whitespace-nowrap transition-all duration-500 -ml-3 -mr-3 ${styles.moveCategory}`} style={{
                    "--move-cat": `${catPage * 100 * -1}vw`
                } as React.CSSProperties}>
                    {catList.map((cl, i) =>
                        <div key={`cat-${i}`} className="w-full inline-block align-top p-3">
                            <CategorySelect list={cl.list} type={cl.name} next={(cat) => {
                                if (!cat.length && i === 0) return;
                                setCategory((prevState) => ({ ...prevState, [cl.name]: cat }));
                                setCatPage(catPage + 1);
                                if (i + 1 === catList.length) {
                                    setTimeout(() => {
                                        getRec();
                                    }, 10);
                                }
                            }} prev={i === 0 ? undefined : () => {
                                setCatPage(catPage - 1);
                            }} title={cl.title} presetValues={category[cl.name as keyof typeof category]} />
                        </div>
                    )}
                </div>
                <div className={`fixed right-0 whitespace-nowrap transition-all duration-500 ${styles.cardBottomFix}`} style={(!!chosenCard ? { "--card-fix-bottom": "-120px" } : {}) as React.CSSProperties}>
                    {cards.map((c, idx) =>
                        <div key={`cardkey-${idx}`} className={`${styles.cardContainer} relative inline-block transition-all duration-500 rounded-lg`} style={
                            (chosenCard ? {
                                "--card-move": `${chosenIdx === idx ? (idx * (cardWidth - 10) * -1) + ((idx - 9) * -10) - 4 : idx * (cardWidth - 10) * -1}px`,
                                "--card-moveY": `${chosenIdx === idx ? '-45vh' : 0}`,
                                "--card-delay": `${chosenIdx === idx || chosenCard.reset ? 0 : idx * 0.25}s`,
                                "--card-scale": `${chosenIdx === idx ? 1 : 0.5}`,
                                "--card-rotate": `${chosenIdx === idx && flip ? '180deg' : 0}`,
                                "--card-z": `${chosenIdx === idx && flip ? '1px' : 0}`,
                            } : {}) as React.CSSProperties}>
                            <div className={`transition-all duration-500 h-full relative ${styles.card}`}>
                                <div className={`${styles.cardFront} absolute w-full h-full p-5 rounded-lg`}>
                                    <div className={`h-full rounded-sm flex flex-col justify-center content-center flex-wrap ${styles.cardPattern}`}>
                                        <div className="border-2 border-theme-color rounded-full p-5 bg-theme-color w-9/12">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416 512" className="w-full aspect-square">
                                                <path fill="none" className="stroke-theme-color" strokeWidth={15} d="M207.9 15.2c.8 4.7 16.1 94.5 16.1 128.8 0 52.3-27.8 89.6-68.9 104.6L168 486.7c.7 13.7-10.2 25.3-24 25.3H80c-13.7 0-24.7-11.5-24-25.3l12.9-238.1C27.7 233.6 0 196.2 0 144 0 109.6 15.3 19.9 16.1 15.2 19.3-5.1 61.4-5.4 64 16.3v141.2c1.3 3.4 15.1 3.2 16 0 1.4-25.3 7.9-139.2 8-141.8 3.3-20.8 44.7-20.8 47.9 0 .2 2.7 6.6 116.5 8 141.8.9 3.2 14.8 3.4 16 0V16.3c2.6-21.6 44.8-21.4 48-1.1zm119.2 285.7l-15 185.1c-1.2 14 9.9 26 23.9 26h56c13.3 0 24-10.7 24-24V24c0-13.2-10.7-24-24-24-82.5 0-221.4 178.5-64.9 300.9z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                {chosenCard && <div className={`${styles.cardBack} absolute w-full h-full p-1.5 rounded-lg`}>
                                    <div className={`bg-theme-color h-full rounded-md p-2 flex justify-between flex-col flex-wrap content-center`}>
                                        <div>
                                            <div className={`w-9/12 relative -mt-7 ml-auto mr-auto ${styles.cardImageContainer}`}>
                                                <Image
                                                    src={chosenCard?.image}
                                                    alt={chosenCard?.title}
                                                    className={`rounded-full`}
                                                    width={180}
                                                    height={180}
                                                />
                                            </div>
                                            <span className={`${montserrat.className} ${styles.cardTitle} rounded-md p-1 -mt-4 block z-10 whitespace-normal relative${chosenCard?.title.length > 14 ? ' text-md' : ' text-lg'}`}>{chosenCard?.title}</span>
                                        </div>
                                        <div>
                                            <a href={`https://www.google.com/maps/search/${encodeURIComponent(chosenCard?.title + ' near me')}/`} target="_blank" rel="noopener noreferrer" className="no-underline block mb-1 border border-theme-color p-1 rounded text-md">
                                                <Image src={'/restaurant-svgrepo-com.svg'} alt="Where to eat" width={24} height={24} className="mr-2 inline-block align-middle" />
                                                Where to eat
                                            </a>
                                            {chosenCard.recipeUrl && <a href={chosenCard.recipeUrl} target="_blank" rel="noopener noreferrer" className="no-underline block border border-theme-color p-1 rounded text-md">
                                                <Image src={'/recipe-svgrepo-com.svg'} alt="How to make" width={24} height={24} className="mr-2 inline-block align-middle" />
                                                How to make
                                                <span className={`block theme-color text-xs`}>({chosenCard.cookTime + chosenCard.prepTime} minutes)</span>
                                            </a>}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end whitespace-normal">
                                            {chosenCard?.categories.map((cat) => Icons(cat.toLowerCase(), 24, 24, (cat !== 'Meat' && cat !== 'Seafood') || [fullCategories[cat], chosenCard.categories].reduce((a, b) => a.filter(c => b.includes(c))).length === 0))}
                                        </div>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    )}
                </div>
                <div className={`fixed w-screen h-screen top-0 left-0 transition-all duration-500 flex justify-center items-center bg-black/50 ${!chosenCard && catPage === catList.length ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416 512" className="w-24 aspect-square animate-pulse">
                        <path fill="none" className="stroke-theme-color" strokeWidth={15} d="M207.9 15.2c.8 4.7 16.1 94.5 16.1 128.8 0 52.3-27.8 89.6-68.9 104.6L168 486.7c.7 13.7-10.2 25.3-24 25.3H80c-13.7 0-24.7-11.5-24-25.3l12.9-238.1C27.7 233.6 0 196.2 0 144 0 109.6 15.3 19.9 16.1 15.2 19.3-5.1 61.4-5.4 64 16.3v141.2c1.3 3.4 15.1 3.2 16 0 1.4-25.3 7.9-139.2 8-141.8 3.3-20.8 44.7-20.8 47.9 0 .2 2.7 6.6 116.5 8 141.8.9 3.2 14.8 3.4 16 0V16.3c2.6-21.6 44.8-21.4 48-1.1zm119.2 285.7l-15 185.1c-1.2 14 9.9 26 23.9 26h56c13.3 0 24-10.7 24-24V24c0-13.2-10.7-24-24-24-82.5 0-221.4 178.5-64.9 300.9z" />
                    </svg>
                </div>
            </div>
        </>
    )
}
