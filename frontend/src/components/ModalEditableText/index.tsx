import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Btn from "../Btn";
import { Box } from "@mui/material";
import TextEditor from './textEditor';
import initialValue from './initialvalueText';
import { Descendant } from 'slate';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function ModalEditableText({ open, handleClose, handleConclusion }: {
    open: boolean;
    handleClose: VoidFunction;
    handleConclusion: (text: Descendant[], linesToBreakPage: number) => Promise<void>;
}) {
    const [text, setText] = React.useState(initialValue);
    const [linesToBreakPage, setLinesToBreakPage] = React.useState(22)

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>{"Descrição Orçamento"}</DialogTitle>
            <DialogContent>
                <Box
                    sx={{ flexDirection: 'column', display: "flex", gap: 1 }}
                >
                    <TextEditor
                        setText={setText}
                        linesToBreakPage={linesToBreakPage}
                        setLinesToBreakPage={setLinesToBreakPage}
                    />
                </Box>
                <Box
                    sx={{ flexDirection: 'column', display: "flex", gap: 1 }}
                >
                    <Btn color="green" onClick={() => { handleConclusion(text, linesToBreakPage) }} action={"Confirmar"} />
                </Box>
            </DialogContent>
        </Dialog>
    );
}