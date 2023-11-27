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

type Project = {
    projectName: string,
    description: string,
    startDate: string,
    endDate: string,
    status: string | null,
    regDate: string,
    regUserid: string,
    confirm: boolean | null,
}

type Task = {
    idNum: number,
    taskName: string,
    description: string,
    startDate: string,
    endDate: string,
    status: string,
    regDate: string,
    regUserid: string,
    projectName: string,
    taskGroupIdNum: number,
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
    projectRoleId: number,
}

interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
    boxStyle?: React.CSSProperties; // 이 줄을 추가합니다.
}

interface ProjectDetailModalProps {
    open: boolean;
    onClose: () => void;
    projectIdNum: number;
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

const ProjectInfoModal: React.FC<ProjectDetailModalProps> = ({ open, onClose, projectIdNum }) => {
    const [tabValue, setTabValue] = useState<number>(0);
    const [projectInfo, setProjectInfo] = useState<Project>();
    const [taskInfo, setTaskInfo] = useState<Task[]>([]);
    const [roleInfo, setRoleInfo] = useState<Role[]>([]);
    const [userInfo, setUserInfo] = useState<ProjectUser[]>([]);
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

    const handleConfirm = (confirm: boolean) => {
        axios.put(`/api/project/confirm/${projectIdNum}`, confirm )
            .then((response) => {
                if (response.status === 200) {
                    if(confirm) {
                        setSuccessMessage("프로젝트의 승인절차가 완료되었습니다.");
                        setSuccessModalOpen(true);
                    } else {
                        setSuccessMessage("프로젝트의 승인요청이 거절되었습니다.");
                        setSuccessModalOpen(true);
                    }
                    setProjectInfo(response.data);
                } else {
                    setErrorMessage("프로젝트의 승인절차가 실패했습니다.");
                    setErrorModalOpen(true);
                }
            })
            .catch((error) => {
                setErrorMessage("프로젝트의 승인절차가 실패했습니다.");
                setErrorModalOpen(true);
            });
    }

    const handleAddRole = () => {
        const newRole = {
            projectId: projectIdNum,
            roleName: '',
            roleLevel: roleInfo.length + 1,
            description: ''
        };
        setRoleInfo([...roleInfo, newRole]);
    };

    const handleRemoveRole = () => {
        const newList = [...roleInfo];
        if(newList.length > 0) {
            newList.pop();
            setRoleInfo(newList);
        }
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
        if(projectIdNum === 0) return;
        // 프로젝트 정보 가져오기
        axios.get(`/api/project/${projectIdNum}`)
            .then((response) => {
                if (response.status === 200) {
                    setProjectInfo(response.data);
                } else {
                    setErrorMessage("프로젝트 정보를 가져오는데 실패했습니다.");
                    setErrorModalOpen(true);
                }
            });

        // 업무 정보 가져오기
        axios.get(`/api/task/${projectIdNum}`)
            .then((response) => {
                if (response.status === 200) {
                    setTaskInfo(response.data);

                    // 진행률 계산
                    response.data && setProgress(Math.round(response.data.filter((task: Task) => task.status === 'DONE').length / response.data.length * 100));

                } else {
                    setErrorMessage("업무 정보를 가져오는데 실패했습니다.");
                    setErrorModalOpen(true);
                }
            })
            .catch((error) => {
                setErrorMessage("업무 정보를 가져오는데 실패했습니다.");
                setErrorModalOpen(true);
            });

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
        axios.get(`/api/project/user/${projectIdNum}`)
            .then((response) => {
                setUserInfo(response.data);
            })
            .catch((error) => {
                setErrorMessage("사용자 정보를 가져오는데 실패했습니다.");
                setErrorModalOpen(true);
            });

    }, [projectIdNum]);


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
                projectInfo && (
                    <DialogContent sx={{ backgroundColor: '#f5f7fa', paddingTop: '24px !important' }}>
                        <Paper variant="outlined" sx={{ padding: 2 }}>
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                                    {projectInfo.projectName}
                                    <Typography variant="body2" ml={1} sx={{ fontSize: '12px', color: '#888888', marginTop: '5px', display: 'inline-block' }}>
                                        {projectInfo.startDate} ~ {projectInfo.endDate}
                                    </Typography>
                                </Typography>
                                <Divider />
                                <Box sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" sx={{ fontSize: '14px', margin: '10px 0' }}>
                                                {projectInfo.description}
                                            </Typography>
                                        </Grid>

                                        {/* 등록자 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>등록자:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {
                                                    allUsers.map((user) => {
                                                        // string을 number로 변환
                                                        if(user.idNum === Number(projectInfo.regUserid)) {
                                                            return user.name;
                                                        }
                                                    })
                                                }
                                            </Typography>
                                        </Grid>

                                        {/* 승인상태 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>승인상태:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {
                                                    projectInfo.confirm == null ? '승인대기' : projectInfo.confirm ? '승인완료' : '승인거절'
                                                }
                                            </Typography>
                                        </Grid>

                                        {/* 승인자 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>승인자:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {
                                                    // TODO: 승인자 정보 가져오기
                                                    "유저"
                                                }
                                            </Typography>
                                        </Grid>

                                        {/* 작업현황 정보 */}
                                        <Grid item xs={3}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', color: '#888888' }}>작업현황:</Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                {
                                                    projectInfo.status === 'TODO' ? '준비중'
                                                        : projectInfo.status === 'WORKING' ? '진행중'
                                                        : projectInfo.status === 'WAITING' ? '대기중'
                                                        : projectInfo.status === 'DONE' ? '완료' : '준비중'
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
                            <Tab label="권한조회" sx={{ "&.Mui-selected": { backgroundColor: 'white' } }} />
                            <Tab label="사용자조회" sx={{ "&.Mui-selected": { backgroundColor: 'white' } }} />
                            <Tab label="업무조회" sx={{ "&.Mui-selected": { backgroundColor: 'white' } }} />
                            {/*<Tab label="업무그룹조회" sx={{ "&.Mui-selected": { backgroundColor: 'white' } }} />*/}
                        </Tabs>
                        <TabPanel
                            value={tabValue}
                            index={0}
                            boxStyle={{ backgroundColor: tabValue === 0 ? 'white' : 'inherit' }}
                        >

                            {
                                isEditMode ? (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon style={{ color: 'rgb(23, 210, 23)', marginRight: '2px', fontSize: '15px' }} />}
                                                sx={{ ...commonButtonStyles }}
                                                onClick={handleAddRole}
                                            >
                                                권한추가
                                            </Button>
                                        </Box>

                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{tableHeaderStyles, width: '75px'}} align="center">권한등급</TableCell>
                                                    <TableCell sx={tableHeaderStyles} align="center">직책명</TableCell>
                                                    <TableCell sx={tableHeaderStyles} align="center">직책설명</TableCell>
                                                    <TableCell sx={tableHeaderStyles} align="center">취소</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {roleInfo.map((role, index) => (
                                                    <TableRow key={index} sx={{ height: '30px' }}>
                                                        <TableCell sx={tableCellStyles} align="center" >
                                                            {role.roleLevel} {/* Display the role level without allowing user input */}
                                                        </TableCell>
                                                        <TableCell sx={tableCellStyles} align="center" >
                                                            <TextField
                                                                fullWidth
                                                                value={role.roleName}
                                                                onChange={(e) => {
                                                                    const newList = [...roleInfo];
                                                                    newList[index].roleName = e.target.value;
                                                                    setRoleInfo(newList);
                                                                }}
                                                                sx={textFieldStyles}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={tableCellStyles} align="center" >
                                                            <TextField
                                                                fullWidth
                                                                value={role.description}
                                                                onChange={(e) => {
                                                                    const newList = [...roleInfo];
                                                                    newList[index].description = e.target.value;
                                                                    setRoleInfo(newList);
                                                                }}
                                                                sx={textFieldStyles}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={tableCellStyles} align="center">
                                                            <IconButton onClick={() => handleRemoveRole()}>
                                                                <DeleteOutline />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                ) : (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ ...tableHeaderStyles, width: '75px' }} align="center">권한등급</TableCell>
                                                <TableCell sx={tableHeaderStyles} align="center">직책명</TableCell>
                                                <TableCell sx={tableHeaderStyles} align="center">직책설명</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {roleInfo.map((role, index) => (
                                                <TableRow key={index} sx={{ height: '30px' }}>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {role.roleLevel} {/* Display the role level without allowing user input */}
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {role.roleName}
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {role.description}
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
                                                <TableCell sx={tableHeaderStyles} align="center">작업자</TableCell>
                                                <TableCell sx={tableHeaderStyles} align="center">직책</TableCell>
                                                <TableCell sx={tableHeaderStyles} align="center">담당업무</TableCell>
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
                                                            roleInfo.filter((item) => item.roleLevel === user.projectRoleId)[0]?.roleName
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={tableCellStyles} align="center" >
                                                        {
                                                            "n개"
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
                                taskInfo.map((task, index) => (
                                    <Grid item xs={12} key={index}>
                                        <MUICard>
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center">
                                                        {
                                                            task.taskName
                                                        }
                                                        <Typography variant="body2"
                                                                    sx={{
                                                                        marginLeft: '10px',
                                                                        color: '#757575',
                                                                        fontSize: '12px',
                                                                        transition: 'opacity 300ms ease-in-out'
                                                                    }}>
                                                            {
                                                                task.startDate + ' ~ ' + task.endDate
                                                            }
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        {/*<Button variant="contained"*/}
                                                        {/*        startIcon={<GroupsIcon style={{ color: '#888888', marginRight: '2px', fontSize: '15px' }} />}*/}
                                                        {/*        sx={{ color: 'black',*/}
                                                        {/*            marginLeft: '10px',*/}
                                                        {/*            marginRight: '10px',*/}
                                                        {/*            fontSize: '12px',*/}
                                                        {/*            fontWeight: 'bold',*/}
                                                        {/*            height: '30px',*/}
                                                        {/*            backgroundColor: 'white',*/}
                                                        {/*            boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important',*/}
                                                        {/*            textTransform: 'none',*/}
                                                        {/*            minWidth: '75px',*/}
                                                        {/*            padding: '0 12px',*/}
                                                        {/*            opacity: expandedTasks.includes(index) ? 1 : 0,*/}
                                                        {/*            transition: 'opacity 300ms ease-in-out',*/}
                                                        {/*            '&:hover': {*/}
                                                        {/*                textDecoration: 'none',*/}
                                                        {/*                backgroundColor: 'rgb(0, 0, 0, 0.1)',*/}
                                                        {/*            }*/}
                                                        {/*        }}*/}
                                                        {/*        onClick={() => {*/}
                                                        {/*            setSelectedTaskIdNum(task.idNum)*/}
                                                        {/*            setTaskUserListOpen(true)*/}
                                                        {/*        }}*/}
                                                        {/*>*/}
                                                        {/*    작업자관리*/}
                                                        {/*</Button>*/}

                                                        <IconButton
                                                            aria-label="expand"
                                                            onClick={() => toggleTaskExpansion(index)}
                                                            sx={{
                                                                transform: expandedTasks.includes(index) ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: '0.3s',
                                                                width: '40px',
                                                                height: '40px',
                                                            }}
                                                        >
                                                            <ExpandMoreIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                <Collapse in={expandedTasks.includes(index)}>

                                                    <Typography variant="body2" sx={{color: '#757575', fontSize: '12px'}}>
                                                        { "진행상태: " + "작업중" }
                                                    </Typography>

                                                    <Typography variant="body2" sx={{color: '#757575', fontSize: '12px'}}>
                                                        { "인원: " + "n명" }
                                                    </Typography>

                                                    <Typography variant="body2" sx={{color: '#757575', fontSize: '12px'}}>
                                                        { "상세설명: " + task.description }
                                                    </Typography>


                                                </Collapse>
                                            </CardContent>
                                        </MUICard>
                                    </Grid>
                                ))
                            }

                        </TabPanel>

                        <TabPanel
                            value={tabValue}
                            index={3}
                            boxStyle={{ backgroundColor: tabValue === 3 ? 'white' : 'inherit' }}
                        >
                            <Typography sx={{p: 3}}>// TODO: 미구현</Typography>
                        </TabPanel>

                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end'}}>


                            {
                                projectInfo.confirm === null ?
                                    getRole() === 'ROLE_ADMIN' ?
                                        <Button
                                            variant="contained"
                                            sx={{
                                                marginLeft: '10px',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                height: '35px',
                                                backgroundColor: 'rgb(40, 49, 66)',
                                                boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important',
                                                textTransform: 'none',
                                                minWidth: '75px',
                                                padding: '0 12px',
                                                '&:hover': {
                                                    textDecoration: 'none',
                                                    backgroundColor: 'rgb(40, 49, 66, 0.8)',
                                                },
                                            }}
                                            onClick={() => handleConfirm(true)}
                                        >
                                            승인
                                        </Button>
                                        : null
                                    : null
                            }


                            {
                                projectInfo.confirm === null ?
                                    getRole() === 'ROLE_ADMIN' ?
                                        <Button
                                            variant="contained"
                                            sx={{
                                                marginLeft: '10px',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                height: '35px',
                                                backgroundColor: 'rgb(40, 49, 66)',
                                                boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important',
                                                textTransform: 'none',
                                                minWidth: '75px',
                                                padding: '0 12px',
                                                '&:hover': {
                                                    textDecoration: 'none',
                                                    backgroundColor: 'rgb(40, 49, 66, 0.8)',
                                                },
                                            }}
                                            onClick={() => handleConfirm(false)}
                                        >
                                            거절
                                        </Button>
                                        : null
                                    : null
                            }
                        </Box>

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

export default ProjectInfoModal;