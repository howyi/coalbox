import React from 'react';

const HIGHLIGHT_STYLE = 'changed-highlight'
const HIGHLIGHTING_STYLE = 'cb-changed-highlighting'
const showAfter = 0;
// .cb-changed-highlighting のcssと時間をあわせる
const hideAfter = 600;

type Props = {
    value: string
}

export const BoxText: React.VFC<Props> = (props) => {
    const [className, setClassName] = React.useState<string>()
    const [init, setInit] = React.useState(true)
    const [displayValue, setDisplayValue] = React.useState(props.value)

    React.useEffect(() => {
        if (init) {
            setInit(false)
            setClassName(HIGHLIGHT_STYLE)
            return
        }

        setTimeout(() => {
            setDisplayValue(props.value)
        }, 300);

        setClassName(`${HIGHLIGHT_STYLE} ${HIGHLIGHTING_STYLE}`)

         setTimeout(() => {
             setClassName(HIGHLIGHT_STYLE)
        }, showAfter + hideAfter);
    }, [props.value])

    return <span className={className} style={{display: 'inline-block', width: '100%'}}>
        {displayValue}
    </span>
}
