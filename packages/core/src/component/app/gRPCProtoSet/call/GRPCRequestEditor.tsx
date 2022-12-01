import React from 'react';
import {Controlled as CodeMirror} from '../../../../utils/codemirror'
// import 'codemirror.css';
import 'codemirror/theme/material.css';
// import 'styles/foldgutter.css'
import {Box} from "@mui/material";
import * as codemirror from 'codemirror';


// @ts-ignore
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/autorefresh');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/brace-fold');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/indent-fold');

type Props = {
    initValue: string
    valueChanged: (value: string) => void
}

export const GRPCRequestEditor: React.VFC<Props> = (props) => {
    const editor = React.useRef<codemirror.Editor>()

    // const [value, setValue] = React.useState<string>(props.initValue)

    // React.useEffect(() => {
    //     if (editor.current) {
    //         editor.current?.setValue(props.initValue)
    //     }
    // }, [props.initValue])

    // React.useEffect(() => {
    //     props.valueChanged(value)
    // }, [value])

    return <Box padding={'5px'} width={'100%'} height={'100%'} overflow={'scroll'}>
        <CodeMirror
        autoCursor={true}
        value={props.initValue}
        options={{
            theme: 'material',
            lineNumbers: true,
            lineWrapping: true,
            mode: {name: "javascript", json: true},
            // @ts-ignore
            autoRefresh: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            foldOptions: {
                widget: (from: any, to: any) => {
                    if (!editor.current) {
                        return
                    }
                    var count = undefined;

                    // Get open / close token
                    var startToken = '{', endToken = '}';
                    var prevLine = editor.current.getLine(from.line);
                    if (prevLine.lastIndexOf('[') > prevLine.lastIndexOf('{')) {
                        startToken = '['
                        endToken = ']'
                    }

                    // Get json content
                    var internal = editor.current?.getRange(from, to);
                    var toParse = startToken + internal + endToken;

                    // Get key count
                    try {
                        var parsed = JSON.parse(toParse);
                        count = Object.keys(parsed).length;
                    } catch (e) {
                    }

                    return count ? `\u21A4${count}\u21A6` : '↔';
                }
            }
        }}
        editorDidMount={(newEditor) => {
            editor.current = newEditor
        }}
        onBeforeChange={(editor, data, value) => {
            props.valueChanged(value)
        }}
    />
    </Box>
}