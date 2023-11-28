import React, {useEffect, useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Typography,
    Box,
    Grid,
    Avatar,
    Button,
    Paper,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    TextField,
    Tooltip,
    TextareaAutosize,
    LinearProgress,
    TableHead,
    TableRow,
    TableCell,
    TableBody, Table, Card as MUICard, CardContent, Collapse,
} from '@mui/material';
import axios from "../../../redux/axiosConfig";
import { Data } from "./data";
import {getRole}  from "../../common/tokenUtils";
import CloseIcon from "@mui/icons-material/Close";
import ErrorModal from "../../common/ErrorModal";
import SuccessModal from "../../common/SuccessModal";
import {DeleteOutline} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Task = {
    taskName: string,
    description: string,
    startDate: string,
    endDate: string,
    status: string | null,
    regDate: string,
    regUserid: string,
    projectName: string,
    projectsIdNum: number,
}

type User = {
    idNum: number,
    loginId: string,
    name: string,
    phone: string,
    email: string,
}

type Role = {
    projectId: number,
    roleName: string,
    roleLevel: number,
    description: string,
}

type ProjectUser = {
    projectId: number,
    userId: number,
    taskRoleId: number,
}

type Data = {
    type: string,
    workTime: number,
    description: string,
}

interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
    boxStyle?: React.CSSProperties; // 이 줄을 추가합니다.
}

interface TaskDetailModalProps {
    open: boolean;
    onClose: () => void;
    taskIdNum: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index , boxStyle }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
        >
            {value === index && (
                <Box p={3} style={boxStyle}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
};

const TaskInfoModal: React.FC<TaskDetailModalProps> = ({ open, onClose, taskIdNum }) => {
    const [tabValue, setTabValue] = useState<number>(0);
    const [taskInfo, setTaskInfo] = useState<Task>({} as Task);
    const [roleInfo, setRoleInfo] = useState<Role[]>([]);
    const [userInfo, setUserInfo] = useState<ProjectUser[]>([]);
    const [workInfo, setWorkInfo] = useState<Data[]>([]);
    const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [isErrorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        event.stopPropagation();
        setTabValue(newValue);
    };

    useEffect(() => {
        axios.get(`/api/user`)
            .then((response) => {
                setAllUsers(response.data);
            })
            .catch((error) => {
                setErrorMessage("사용자 정보를 가져오는데 실패했습니다.");
                setErrorModalOpen(true);
            });

    }, []);

    useEffect(() => {
        if(taskIdNum === 0 || taskIdNum == undefined) return;
        // 프로젝트 정보 가져오기
        axios.get(`/api/task/info/${taskIdNum}`)
            .then((response) => {
                if (response.status === 200) {
                    setTaskInfo(response.data);

                    const projectIdNum = response.data.projectsIdNum;

                    // 권한 정보 가져오기
                    axios.get(`/api/project/role/${projectIdNum}`)
                        .then((response) => {
                            setRoleInfo(response.data);
                        })
                        .catch((error) => {
                            setErrorMessage("권한 정보를 가져오는데 실패했습니다.");
                            setErrorModalOpen(true);
                        });

                    // 사용자 정보 가져오기
                    axios.get(`/api/task/user/${taskIdNum}`)
                        .then((response) => {
                            setUserInfo(response.data);
                        })
                        .catch((error) => {
                            setErrorMessage("사용자 정보를 가져오는데 실패했습니다.");
                            setErrorModalOpen(true);
                        });

                    // 공수 정보 가져오기
                    axios.get(`/api/task/work/${taskIdNum}`)
                        .then((response) => {
                            setWorkInfo(response.data);
                        })
                        .catch((error) => {
                            setErrorMessage("공수 정보를 가져오는데 실패했습니다.");
                            setErrorModalOpen(true);
                        });

                } else {
                    setErrorMessage("업무 정보를 가져오는데 실패했습니다.");
                    setErrorModalOpen(true);
                }
            });

    }, [taskIdNum]);


    const commonButtonStyles = {
        color: 'black',
        marginLeft: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
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

    const tableHeaderStyles = {
        border: "1px solid rgba(0, 0, 0, 0.12)",
        padding: "0px 10px",
        fontWeight: "bold",
        fontSize: "12px",
        backgroundColor: "hsl(210, 7%, 89%)",
        maxWidth: "100px",
    };

    const tableBodyStyles = {
        height: "30px",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        padding: "0px 10px",
        fontSize: "12px",
    };

    const tableCellStyles = {
        ...tableBodyStyles,
        height: "30px",
        verticalAlign: 'middle'
    };

    const textFieldStyles = {
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#409aff',
        },
        '& .MuiInputBase-input': {
            padding: 0,
            fontSize: '12px',
            height: '25px',
            paddingLeft: '10px',
            backgroundColor: '#fff'
        }
    }


    const toggleTaskExpansion = (index: number) => {
        const newExpandedTasks = [...expandedTasks];
        if (newExpandedTasks.includes(index)) {
            const indexToRemove = newExpandedTasks.indexOf(index);
            newExpandedTasks.splice(indexToRemove, 1);
        } else {
            newExpandedTasks.push(index);
        }
        setExpandedTasks(newExpandedTasks);
    };

    return (
        <Dialog open={open} onClose={onClose} onClick={(event) => event.stopPropagation()} fullWidth maxWidth="sm">
            <DialogTitle sx={{pb: 1, backgroundColor: '#f5f7fa', }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{marginTop: '12px'}}>
                    <Typography variant="h6" sx={{fontSize: '16px', fontWeight: 'bold'}}>프로젝트 상세정보</Typography>
                    <IconButton onClick={onClose} size="small" sx={{ padding: '0' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            {
                taskInfo && (
                    <DialogContent sx={{ backgroundColor: '#f5f7fa', paddingTop: '24px !important' }}>
                        <Paper variant="outlined" sx={{ padding: 2 }}>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                                    {taskInfo.taskName}
                                    <Typography variant="body2" ml={1} sx={{ fontSize: '12px', color: '#888888', marginTop: '5px', display: 'inline-block' }}>
                                        {taskInfo.startDate} ~ {taskInfo.endDate}
                                    </Typography>
                                </Typography>
                                <Divider />
                                <Box sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" sx={{ fontSize: '14px', margin: '10px 0' }}>
                                                {taskInfo.description}
                                            </Typography>
                                        </Grid>

                                        {/* 프로젝트 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>프로젝트:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {taskInfo.projectName}
                                            </Typography>
                                        </Grid>

                                        {/* 등록자 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>등록자:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {
                                                    allUsers.map((user) => {
                                                        // string을 number로 변환
                                                        if(user.idNum === Number(taskInfo.regUserid)) {
                                                            return user.name;
                                                        }
                                                    })
                                                }
                                            </Typography>
                                        </Grid>

                                        {/* 작업현황 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>작업현황:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {
                                                    taskInfo.status === 'TODO' ? '준비중'
                                                        : taskInfo.status === 'WORKING' ? '진행중'
                                                            : taskInfo.status === 'WAITING' ? '대기중'
                                                                : taskInfo.status === 'DONE' ? '완료' : '준비중'
                                                }
                                            </Typography>
                                        </Grid>

                                        {/* 작업현황 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>공수시간:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {
                                                    // workInfo의 배열에 type이 'DONE'인 값들이 있으면 해당 값들의 workTime을 모두 더한 값을 반환
                                                    workInfo.filter((work) => work.type === 'DONE').length > 0
                                                        ? workInfo.filter((work) => work.type === 'DONE').map((work) => work.workTime).reduce((a, b) => a + b) + '시간'
                                                        : '작업 진행중'
                                                }
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={12} sx={{ mt: 2 }}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>작업 진행율:</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                    <LinearProgress variant="determinate" value={0} />
                                                </Box>
                                                <Box sx={{ minWidth: 35 }}>
                                                    <Typography variant="body2" sx={{ fontSize: '14px' }}>{`${0}%`}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                    </Grid>
                                </Box>
                            </Box>
                        </Paper>

                        <Tabs value={tabValue} onChange={handleChange} sx={{ marginTop: 2 }}>
                            <Tab label="사용자조회" sx={{ "&.Mui-selected": { backgroundColor: 'white' } }} />
                            <Tab label="공수관리" sx={{ "&.Mui-selected": { backgroundColor: 'white' } }} />
                            <Tab label="이슈관리" sx={{ "&.Mui-selected": { backgroundColor: 'white' } }} />
                        </Tabs>
                        <TabPanel
                            value={tabValue}
                            index={0}
                            boxStyle={{ backgroundColor: tabValue === 0 ? 'white' : 'inherit' }}
                        >

                            {
                                isEditMode ? (
                                    <>
                                    </>
                                ) : (
                                    // 편집없이 조회만 가능한 경우
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={tableHeaderStyles} align="center">작업자</TableCell>
                                                <TableCell sx={tableHeaderStyles} align="center">직책</TableCell>
                                                <TableCell sx={tableHeaderStyles} align="center">공수시간</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {userInfo.map((user, index) => (
                                                <TableRow key={index} sx={{ height: '30px' }}>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {
                                                            allUsers.filter((item) => item.idNum === user.userId)[0].name
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {
                                                            roleInfo.filter((item) => item.roleLevel === user.taskRoleId)[0]?.roleName
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {
                                                            workInfo.filter((item) => item.regUserid === user.userId).length > 0
                                                                ? workInfo.filter((item) => item.regUserid === user.userId).map((item) => item.workTime).reduce((a, b) => a + b) + '시간'
                                                                : '작업 진행중'
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )
                            }

                        </TabPanel>

                        <TabPanel
                            value={tabValue}
                            index={1}
                            boxStyle={{ backgroundColor: tabValue === 1 ? 'white' : 'inherit' }}
                        >


                            {
                                isEditMode ? (
                                    <>
                                    </>
                                ) : (
                                    // 편집없이 조회만 가능한 경우
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={tableHeaderStyles} align="center">등록자</TableCell>
                                                <TableCell sx={tableHeaderStyles} align="center">공수시간</TableCell>
                                                <TableCell sx={{
                                                    ...tableHeaderStyles,
                                                    width: '100px'
                                                }} align="center">세부정보</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {workInfo
                                                .filter((work) => work.type === 'DONE')
                                                .map((work, index) => (
                                                <TableRow key={index} sx={{ height: '30px' }}>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {
                                                            allUsers.filter((item) => item.idNum === work.regUserid)[0]?.name
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {
                                                            work.workTime + '시간'
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {

                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )
                            }

                        </TabPanel>

                        <TabPanel
                            value={tabValue}
                            index={2}
                            boxStyle={{ backgroundColor: tabValue === 2 ? 'white' : 'inherit' }}
                        >
                            {
                                isEditMode ? (
                                    <>
                                    </>
                                ) : (
                                    // 편집없이 조회만 가능한 경우
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={tableHeaderStyles} align="center">등록자</TableCell>
                                                <TableCell sx={{
                                                    ...tableHeaderStyles,
                                                    width: '100px'
                                                }} align="center">세부정보</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {workInfo
                                                .filter((work) => work.type === 'ISSUE')
                                                .map((work, index) => (
                                                    <TableRow key={index} sx={{ height: '30px' }}>
                                                        <TableCell sx={tableCellStyles} align="center" >
                                                            {
                                                                allUsers.filter((item) => item.idNum === work.regUserid)[0]?.name
                                                            }
                                                        </TableCell>
                                                        <TableCell sx={tableCellStyles} align="center" >
                                                            {

                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                )
                            }

                        </TabPanel>

                    </DialogContent>
                )
            }

            {/*성공 Modal*/}
            <SuccessModal
                open={isSuccessModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title={""}
                description={successMessage || ""}
            />

            {/*에러 발생 Modal*/}
            <ErrorModal
                open={isErrorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="요청 실패"
                description={errorMessage || ""}
            />

            <DialogActions sx={{backgroundColor: '#f5f7fa'}}>
            </DialogActions>
        </Dialog>
    );
};

export default TaskInfoModal;