import * as React from 'react';
import {alpha} from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {Button, Stack} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import {createData} from "./data";  // 빈 배열을 생성하기위한 함수

interface EnhancedTableToolbarProps {
    numSelected: number;
    tableName: string;  // tableName을 DB에서 가져올 수 있음
    onAdd: () => void;
    onSave: () => void;
    onUpdate: () => void;
    onDelete: () => void;
}

export default function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const {numSelected, tableName, onAdd, onSave, onUpdate, onDelete} = props;

    // 버튼 공통 스타일
    const commonButtonStyles = {
        color: 'black',
        marginLeft: '10px',
        fontSize: '12px',
        height: '30px',
        backgroundColor: 'white',
        boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important',
        textTransform: 'none',
        minWidth: '75px',
        padding: '0 12px',
        '&:hover': {
            textDecoration: 'none',
            backgroundColor: 'rgb(0, 0, 0, 0.1)',
        },
    };


    // props로 dispatch를 받아서 처리할 수 있음
    // 추후 dispatch를 전달받아 동일한 형식 내에서의 다른 처리를 할 수 있음
    function handleDelete() {
        console.log("delete")
    }

    return (
        <Toolbar
            sx={{
                pl: {sm: 2},
                pr: {xs: 1, sm: 1},
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{flex: '1 1 100%'}}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{flex: '1 1 100%'}}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    {/*// tableName을 DB에서 가져올 수 있음*/}
                    {tableName}
                </Typography>
            )}
            <Stack direction="row" spacing={1}>
                <Button variant="contained"
                        startIcon={<SaveIcon style={{ color: 'rgb(81, 128, 253)', marginRight: '2px', fontSize: '15px' }} />}
                        sx={{ ...commonButtonStyles }}
                        onClick={onSave}
                >
                    저장
                </Button>
                <Button variant="contained"
                        startIcon={<AddIcon style={{ color: 'rgb(23, 210, 23)', marginRight: '2px', fontSize: '15px' }} />}
                        sx={{ ...commonButtonStyles }}
                        onClick={onAdd}
                >
                    추가
                </Button>
                <Button variant="contained"
                        startIcon={<EditIcon style={{ color: 'gray', marginRight: '2px', fontSize: '15px' }} />}
                        sx={{ ...commonButtonStyles }}
                        onClick={onUpdate}
                >
                    수정
                </Button>
                <Button variant="contained"
                        startIcon={<RemoveIcon style={{ color: 'red', marginRight: '2px', fontSize: '15px' }} />}
                        sx={{ ...commonButtonStyles }}
                        onClick={onDelete}>
                    삭제
                </Button>
            </Stack>
        </Toolbar>
    );
}
