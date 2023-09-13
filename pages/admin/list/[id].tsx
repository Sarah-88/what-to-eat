import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import dashify from 'dashify';
import axios from 'axios';
import { Recipe } from '../../../utils/types';
import { Montserrat } from '@next/font/google';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';
import { fullCategories, getCategoriesDropdown } from '../../../utils/categories';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const fullForm = [
    {
        name: 'title',
        title: 'Title',
        type: 'text',
        required: true
    },
    {
        name: 'cuisine',
        title: 'Cuisine',
        type: 'select',
        options: fullCategories.Cuisine
    },
    {
        name: 'categories',
        title: 'Categories',
        type: 'multiSelect',
        options: getCategoriesDropdown(),
        required: true
    },
    {
        name: 'image',
        title: 'Image',
        type: 'file',
    },
    {
        name: 'prepTime',
        title: 'Preparation Time',
        type: 'number'
    },
    {
        name: 'cookTime',
        title: 'Cooking Time',
        type: 'number'
    },
    {
        name: 'recipeUrl',
        title: 'Recipe URL',
        type: 'text'
    }
];

const HandleRecipe: React.FC = () => {
    const router = useRouter()

    const [recId, setRecId] = useState('add');
    const [currImg, setCurrImg] = useState<File>();
    const [content, setContent] = useState<Recipe>({
        slug: '',
        title: '',
        categories: [],
        cuisine: '',
        prepTime: 0,
        cookTime: 0,
        created: '',
        recipeUrl: ''
    })

    useEffect(() => {
        (async () => {
            const { id } = router.query;
            if (id && id !== 'add') {
                const res = await axios.get(`/api/recipe/${id}`);
                setContent(res.data)
            }
            id && setRecId(id as string);
        })();
    }, [router])

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { value, name } = e.target;
        let newVal: string | string[] | number = value;
        const oriVal = content[name as keyof Recipe];
        if ('files' in e.target && e.target.files) {
            setCurrImg(e.target.files[0]);
            return;
        }
        if (Array.isArray(oriVal)) {
            if ('options' in e.target) {
                newVal = [];
                for (let i = 0; i < e.target.options.length; i++) {
                    if (e.target.options[i].selected) newVal.push(e.target.options[i].value);
                }
            } else if (oriVal.includes(value)) {
                newVal = [...oriVal.filter(o => o !== value)]
            } else {
                newVal = [...oriVal, value]
            }
        }
        setContent(prevState => ({ ...prevState, [name]: newVal }));
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recId === 'add') {
            const resp = await axios.post(`/api/recipe`, {
                ...content,
                slug: dashify(content.title),
                created: new Date().toISOString()
            });
            if (resp.data.id && currImg) {
                const storageRef = ref(storage, `recipe/${resp.data.id}`);
                uploadBytes(storageRef, currImg).then((snapshot) => {
                    console.log('Uploaded a blob or file!', snapshot);
                });
            }
        } else {
            axios.put(`/api/recipe/${recId}`, {
                ...content,
                slug: dashify(content.title),
            }).then(() => {
                if (currImg) {
                    const storageRef = ref(storage, `recipe/${recId}`);
                    uploadBytes(storageRef, currImg).then((snapshot) => {
                        console.log('Uploaded a blob or file!', snapshot);
                    });
                }
            });
        }
    }

    const onDelete = async () => {
        const { id } = router.query;
        await axios.delete(`/api/recipe/${id}`);
        router.back();
    }

    const generateForm = React.useCallback(() => {
        return fullForm.map((f, idx) => {
            const label = <label key={`form-label-${idx}`} className="p-2">{f.title}</label>
            switch (f.type) {
                case 'select':
                case 'multiSelect':
                    return <>
                        {label}
                        <select
                            key={`form-el-${idx}`}
                            name={f.name}
                            value={content[f.name as keyof Recipe]}
                            onChange={onChange}
                            className="rounded-sm p-2"
                            required={!!f.required}
                            multiple={f.type === 'multiSelect'}
                        >
                            {f.options?.map((opt, i) => <option key={`${f.name}-${i}`} value={opt}>{opt}</option>)}
                        </select>
                    </>
                case 'textarea':
                    return <>
                        {label}
                        <textarea
                            key={`form-el-${idx}`}
                            name={f.name}
                            value={content[f.name as keyof Recipe]}
                            className="rounded-sm p-2"
                            rows={3}
                            required={!!f.required}
                            onChange={onChange}
                        />
                    </>
                case 'multiTextarea':
                    return <>
                        {label}
                        <textarea
                            key={`form-el-${idx}`}
                            name={f.name}
                            value={content[f.name as keyof Recipe]}
                            className="rounded-sm p-2"
                            rows={3}
                            required={!!f.required}
                            onChange={onChange}
                        />
                    </>
                case 'multiInput':
                    return <>
                        {label}
                        <input
                            key={`form-el-${idx}`}
                            type={f.type}
                            name={f.name}
                            value={content[f.name as keyof Recipe]}
                            className="rounded-sm p-2"
                            onChange={onChange}
                        />
                    </>
                case 'tag':
                    return <>
                        {label}
                        <input
                            key={`form-el-${idx}`}
                            type={f.type}
                            name={f.name}
                            value={content[f.name as keyof Recipe]}
                            className="rounded-sm p-2"
                            onChange={onChange}
                        />
                    </>
                default:
                    return <>
                        {label}
                        <input
                            key={`form-el-${idx}`}
                            type={f.type}
                            name={f.name}
                            value={content[f.name as keyof Recipe]}
                            className="rounded-sm p-2"
                            required={!!f.required}
                            onChange={onChange}
                        />
                    </>
            }
        })
    }, [content]);

    return (
        <div className="p-5 max-w-3xl m-auto">
            <h2 className={`font-bold text-xl text-center ${montserrat.className}`}>{recId === 'add' ? 'Create' : 'Edit'} Recipe</h2>
            <form action="/recipe" onSubmit={onSubmit} method="POST" className="grid grid-cols-[200px_1fr] gap-2 mt-5">
                {generateForm()}
                <button
                    type="submit"
                >
                    Submit
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                >
                    Delete
                </button>
            </form>
        </div>
    );
};

export default HandleRecipe;