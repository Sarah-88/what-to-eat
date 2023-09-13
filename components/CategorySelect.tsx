import { Montserrat, Carter_One } from '@next/font/google'
import styles from '../styles/main.module.css'
import React, { useEffect } from 'react'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' })
const carter = Carter_One({ weight: "400", variable: '--font-carter', display: 'swap' })

type Props = {
    list: string[];
    next: (chosenItems: string[]) => void;
    prev?: () => void;
    title: string;
    type: string;
    presetValues: string[];
};

const CategorySelect: React.FC<Props> = (props) => {
    const [chosen, setChosen] = React.useState(props.presetValues);
    const halfPoint = props.list.length < 12 ? 0 : Math.round(props.list.length / 2);
    const splitList = React.useMemo(() => {
        if (props.list.length < 12) {
            return [props.list];
        }
        return [props.list.slice(0, halfPoint), props.list.slice(halfPoint)];
    }, [props.list]);

    return (
        <div className={`border-theme-color border mt-5 p-3 ml-auto mr-auto rounded-3xl max-w-2xl`}>
            <p className="">{props.title}</p>
            <div className="mt-3 flex">
                {splitList.map((sl, i) =>
                    <ul key={`catg-${i}`} className="w-1/2">
                        {sl.map((c, idx) =>
                            <li key={`${props.type}-${idx}`} className="text-left">
                                <label htmlFor={`${props.type}-${c}`} className="inline-block p-1">
                                    <input id={`${props.type}-${c}`} type="checkbox" name="cuisine" className="mr-2 align-middle" value={c} checked={chosen.includes(c)} onChange={(e) => {
                                        setChosen((prevState) => {
                                            let newState = [...prevState];
                                            if (!!e.target.checked) {
                                                newState.push(c)
                                            } else {
                                                newState.splice(newState.indexOf(c), 1)
                                            }
                                            return newState;
                                        });
                                    }} />
                                    {c}
                                </label>
                            </li>
                        )}
                    </ul>
                )}
            </div>
            <div className={`mt-3 flex ${props.prev ? 'justify-between' : 'justify-end'}`}>
                {props.prev && <button type="button" className="border-theme-color border rounded-full p-3 pl-3.5 pr-2.5 theme-color" onClick={props.prev}><div className="border-theme-color border-b-4 border-l-4 rotate-45 w-3 h-3"></div></button>}
                <button type="button" className="border-theme-color border rounded-full p-3 pl-2.5 pr-3.5 theme-color" onClick={() => props.next(chosen)}><div className="border-theme-color border-t-4 border-r-4 rotate-45 w-3 h-3"></div></button>
            </div>
        </div>
    )
}

export default CategorySelect;
