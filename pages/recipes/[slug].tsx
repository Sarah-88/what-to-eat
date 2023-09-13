import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router'
import db from '../../utils/db';
import { Recipe } from '../../utils/types';

const SingleRecipe: React.FC<{ recipe: Recipe }> = (props) => {
    const { recipe } = props;
    const router = useRouter()
    if (router.isFallback) {
        return (
            <div>loading</div>
        )
    } else {
        if (recipe) {
            return (
                <div>
                    <h1>{recipe.title}</h1>
                    <h4>{recipe.created}</h4>
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
    const recipes = await db.collection("recipes").get()
    const paths = recipes.docs.map(recipe => ({
        params: {
            slug: recipe.data().slug
        }
    }));
    return {
        paths,
        fallback: true
    }
}

export const getStaticProps = async (context: GetStaticPropsContext<{ slug: string }>) => {
    const { slug } = context.params!;
    const res = await db.collection("recipes").where("slug", "==", slug).get()
    const recipe = res.docs.map(recipe => recipe.data());
    if (recipe.length) {
        return {
            props: {
                recipe: recipe[0]
            }
        }
    } else {
        return {
            props: {}
        }
    }
}

export default SingleRecipe;