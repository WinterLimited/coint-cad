import React, {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, TreeItemProps, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import Collapse from '@mui/material/Collapse';
import { useSpring, animated } from '@react-spring/web';
import { TransitionProps } from '@mui/material/transitions';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import {Box, IconButton, Modal, Tooltip, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FolderIcon from "@mui/icons-material/Folder";
import axios from "../../../../redux/axiosConfig";
import ErrorModal from "../../../common/ErrorModal";
import SuccessModal from "../../../common/SuccessModal";
import NewGroupModal from "./NewGroupModal";

// props
interface TransferListProps {
    projectsIdNum: number;
    taskGroupIdNum: number;
}

interface GroupTableProps {
    open: boolean;
    onClose: () => void;
}

type projectResponse = {
    idNum: number;
    projectName: string;
}

type projectTaskResponse = {
    idNum: number;
    taskName: string;
    projectsIdNum: number;
    taskGroupIdNum: number;
}

type taskGroupResponse = {
    idNum: number;
    taskGroupName: string;
    projectsIdNum: number;
}

function MinusSquare(props: SvgIconProps) {
    return (
        <FolderOpenIcon sx={{ width: 14, height: 14 }} {...props} />
    );
}

function PlusSquare(props: SvgIconProps) {
    return (
        <FolderIcon sx={{ width: 14, height: 14 }} {...props}  />
    );
}

function CloseSquare(props: SvgIconProps) {
    return (
        <FolderOpenIcon
            className="close"
            fontSize="inherit"
            sx={{ width: 14, height: 14 }}
            {...props}
        >
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
        </FolderOpenIcon>
    );
}

function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
        from: {
            opacity: 0,
            transform: 'translate3d(20px,0,0)',
        },
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
        },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
        '& .close': {
            opacity: 0.3,
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
}));

function intersection(a: projectTaskResponse[], b: projectTaskResponse[]): projectTaskResponse[] {
    return a.filter(valueA => b.some(valueB => valueB.idNum === valueA.idNum));
}

function SelectAllTransferList({projectsIdNum, taskGroupIdNum}: TransferListProps) {
    const [checked, setChecked] = useState<projectTaskResponse[]>([]);
    const [left, setLeft] = useState<projectTaskResponse[]>([]);
    const [right, setRight] = useState<projectTaskResponse[]>([]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value: projectTaskResponse) => () => {
        const currentIndex = checked.findIndex(item => item.idNum === value.idNum);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    useEffect(() => {
        const taskbyProjectIdNum = async () => {
            try {
                const projectResponse = await axios.get(`/api/task/${projectsIdNum}`);
                const projectTaskResponse = projectResponse.data.filter((task: projectTaskResponse) => task.taskGroupIdNum === null);
                setRight(projectTaskResponse);
            } catch (error) {
                console.log(error);
                return;
            }
        };
        taskbyProjectIdNum();
    }, [projectsIdNum]);


    useEffect(() => {
        const taskbyTaskGroupIdNum = async () => {
            try {
                const taskGroupResponse = await axios.get(`/api/task/taskgroup/${taskGroupIdNum}`);
                const taskGroupTaskResponse = taskGroupResponse.data;
                setLeft(taskGroupTaskResponse);
            } catch (error) {
                console.log(error);
                return;
            }
        }
        taskbyTaskGroupIdNum();
    }, [taskGroupIdNum]);

    const handleCheckedRight = () => {
        // left에 선택된 항목들을 전부 반복문을 통해 axios 요청
        // 요청이 성공하면 left, right state를 갱신
        leftChecked.forEach(async (task) => {
            try {
                await axios.put(`/api/task/group/task`, task.idNum);

                setRight(right.concat(leftChecked));
                setLeft(left.filter(value => !leftChecked.some(item => item.idNum === value.idNum)));
                setChecked(checked.filter(value => !leftChecked.some(item => item.idNum === value.idNum)));
            } catch (error) {
                console.log(error);
                return;
            }
        });
    };

    const handleCheckedLeft = () => {
        // right에 선택된 항목들을 전부 반복문을 통해 axios 요청
        // 요청이 성공하면 left, right state를 갱신
        rightChecked.forEach(async (task) => {
            try {
                await axios.put(`/api/task/group/${taskGroupIdNum}`, task.idNum);

                setLeft(left.concat(rightChecked));
                setRight(right.filter(value => !rightChecked.some(item => item.idNum === value.idNum)));
                setChecked(checked.filter(value => !rightChecked.some(item => item.idNum === value.idNum)));
            } catch (error) {
                console.log(error);
                return;
            }
        });
    };

    return (
        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{minWidth: '580px'}}>
            <Grid item xs={5}>
                <Card>
                    <CardHeader
                        avatar={<Checkbox checked={leftChecked.length === left.length && left.length !== 0} />}
                        title={`그룹 내 업무`}
                        subheader={`${leftChecked.length}/${left.length} 선택됨`}
                    />
                    <Divider />
                    <List dense component="div" role="list" sx={{
                        width: '250px',
                        height: '300px',
                        overflowY: 'auto'
                    }}>
                        {
                            left.length ?
                                left.map((value) => (
                                    <ListItem key={value.idNum} role="listitem" button onClick={handleToggle(value)}>
                                        <ListItemIcon>
                                            <Checkbox checked={checked.some(item => item.idNum === value.idNum)} />
                                        </ListItemIcon>
                                        <ListItemText id={value.idNum.toString()} primary={value.taskName}
                                                      sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}  />
                                    </ListItem>
                                ))
                                : <ListItem><ListItemText primary="정보가 존재하지 않습니다" /></ListItem>
                        }
                        <ListItem />
                    </List>
                </Card>
            </Grid>
            <Grid item xs={2}>
                <Grid container direction="column" alignItems="center">
                    <Button variant="outlined" size="small" onClick={handleCheckedLeft} disabled={rightChecked.length === 0}>
                        &lt;
                    </Button>
                    <br/>
                    <Button variant="outlined" size="small" onClick={handleCheckedRight} disabled={leftChecked.length === 0}>
                        &gt;
                    </Button>
                </Grid>
            </Grid>
            <Grid item xs={5}>
                <Card>
                    <CardHeader
                        avatar={<Checkbox checked={rightChecked.length === right.length && right.length !== 0} />}
                        title="업무"
                        subheader={`${rightChecked.length}/${right.length} 선택됨`}
                    />
                    <Divider />
                    <List dense component="div" role="list" sx={{
                        width: '250px',
                        height: '300px',
                        overflowY: 'auto'
                    }}>
                        {
                            right.length ?
                                right.map((value) => (
                                    <ListItem key={value.idNum} role="listitem" button onClick={handleToggle(value)}>
                                        <ListItemIcon>
                                            <Checkbox checked={checked.some(item => item.idNum === value.idNum)} />
                                        </ListItemIcon>
                                        <ListItemText id={value.idNum.toString()} primary={value.taskName}
                                                      sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}  />
                                    </ListItem>
                                ))
                                : <ListItem><ListItemText primary="정보가 존재하지 않습니다" /></ListItem>
                        }
                        <ListItem />
                    </List>
                </Card>
            </Grid>
        </Grid>
    );
}

function GroupTable({open, onClose}: GroupTableProps) {
    const [project, setProject] = useState<projectResponse[]>([]);
    const [taskGroups, setTaskGroups] = useState<taskGroupResponse[]>([]);
    const [projectsIdNum, setProjectsIdNum] = useState<number>(0);
    const [taskGroupIdNum, setTaskGroupIdNum] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
    const [newGroupModalOpen, setNewGroupModalOpen] = useState<boolean>(false);
    const [newProjectId, setNewProjectId] = useState<number>(0);
    const [refreshData, setRefreshData] = useState<boolean>(false);


    // expanded 배열을 관리하는 상태 변수 추가
    const [expanded, setExpanded] = useState<string[]>(['root']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectResponse = await axios.get(`/api/project`);
                setProject(projectResponse.data);

                // 모든 프로젝트에 대한 TaskGroup 데이터를 한 번에 가져옵니다.
                const allTaskGroups: taskGroupResponse[] = [];
                for (let proj of projectResponse.data) {
                    const taskGroupResponse = await axios.get(`/api/task/group/${proj.idNum}`);
                    allTaskGroups.push(...taskGroupResponse.data);
                }
                setTaskGroups(allTaskGroups);
            } catch (error) {
                setErrorMessage('폴더 조회 실패');
                setErrorModalOpen(true);
                return;
            }
        };
        fetchData();
    },[refreshData]);


    // expanded 배열을 관리하는 함수 추가
    const handleNodeToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
        const latestNodeId = nodeIds[0];

        // 프로젝트의 ID만 저장합니다. (다른 노드들은 무시)
        if (project.some(proj => proj.idNum.toString() === latestNodeId)) {
            setExpanded(['root', latestNodeId]);
        } else {
            setExpanded(['root']);
        }
    };


    // 새 그룹을 추가하는 함수
    const addNewGroup = (projectId: number) => {
        setNewProjectId(projectId);
        setNewGroupModalOpen(true);
    }

    // 각 프로젝트에 대한 TaskGroup들을 렌더링하는 함수
    const renderTaskGroupsForProject = (projectId: number) => {
        const taskGroupsForProject = taskGroups.filter((taskGroup) => taskGroup.projectsIdNum === projectId);

        return (
            <>
                {taskGroupsForProject.map((taskGroup) => (
                    <TreeItem
                        key={taskGroup.idNum}
                        nodeId={taskGroup.idNum.toString()}
                        label={<Typography style={{fontSize: '14px'}}
                        onClick={() => {setTaskGroupIdNum(taskGroup.idNum)}}>{taskGroup.taskGroupName}</Typography>}
                    />
                ))}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon style={{ color: 'rgb(23, 210, 23)', fontSize: '16px' }}  />}
                    sx={{
                        color: 'black',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        height: '30px',
                        backgroundColor: 'white',
                        boxShadow: 'none',
                        textTransform: 'none',
                        minWidth: '75px',
                        padding: '0 12px',
                        '&:hover': {
                            textDecoration: 'none',
                            boxShadow: 'none',
                            backgroundColor: 'rgb(0, 0, 0, 0.1)',
                        },
                    }}
                    onClick={() => addNewGroup(projectId)}>
                    새 업무그룹
                </Button>
            </>
        );
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                minWidth: 1000,
                minHeight: '50vh',
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: '10px',
            }}>
                <Typography variant="h6"
                            component={"div"}
                            sx={{
                                borderBottom: '2px solid #f0f0f0',
                                pb: 2,
                                mb: 2,
                                fontSize: '18px',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                            <span>
                                업무 그룹 관리
                            </span>
                    <IconButton onClick={onClose} size="small" sx={{ padding: '0' }}>
                        <CloseIcon />
                    </IconButton>
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <TreeView
                        aria-label="customized"
                        expanded={expanded}
                        onNodeToggle={handleNodeToggle}
                        defaultCollapseIcon={<MinusSquare />}
                        defaultExpandIcon={<PlusSquare />}
                        defaultEndIcon={<CloseSquare />}
                        sx={{ flexGrow: 1, minWidth: '250px', width: '100%', height: '100%' }}>
                            <StyledTreeItem nodeId="root" label="프로젝트">
                                {project.map((proj) => (
                                    <StyledTreeItem
                                        key={proj.idNum}
                                        nodeId={proj.idNum.toString()}
                                        label={<Typography style={{ fontSize: '14px' }}>{proj.projectName}</Typography>}
                                        onClick={() => {
                                            setProjectsIdNum(proj.idNum)
                                            setTaskGroupIdNum(0)
                                        }}
                                    >
                                        {renderTaskGroupsForProject(proj.idNum)}
                                    </StyledTreeItem>
                                ))}
                            </StyledTreeItem>
                        </TreeView>
                    </Grid>
                    <Grid item xs={8}>
                        <SelectAllTransferList
                        projectsIdNum={projectsIdNum}
                        taskGroupIdNum={taskGroupIdNum}
                        />
                    </Grid>
                </Grid>

                {/*새 그룹 추가 Modal*/}
                <NewGroupModal
                    open={newGroupModalOpen}
                    handleClose={() => setNewGroupModalOpen(false)}
                    projectsIdNum={newProjectId}
                    onGroupAdded={() => setRefreshData(prev => !prev)}
                />

                {/*에러 발생 Modal*/}
                <ErrorModal
                    open={errorModalOpen}
                    onClose={() => setErrorModalOpen(false)}
                    title="요청 실패"
                    description={errorMessage || ""}
                />

                {/*성공 확인 Modal*/}
                <SuccessModal
                    open={successModalOpen}
                    onClose={() => setSuccessModalOpen(false)}
                    title="요청 성공"
                    description={successMessage || ""}
                />
            </Box>
        </Modal>
    );
}

export default GroupTable;
