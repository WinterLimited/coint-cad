import React, {SyntheticEvent, useEffect, useRef, useState} from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { CSSTransition } from 'react-transition-group';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Autocomplete,
    AutocompleteInputChangeReason,
    Box,
    Paper,
    Typography,
    Card as MUICard,
    Grid,
    TextField,
    Divider, Chip, Button,
    Tooltip, IconButton, CardContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {green, yellow, red, blue} from '@mui/material/colors';
import axios from "../../../redux/axiosConfig";
import ErrorModal from "../../common/ErrorModal";
import "../../../assets/css/common/kanban-transition.css"
import StatusModal from "./StatusModal";

const ItemType = {
    CARD: 'card',
};

type Status = 'TODO' | 'WORKING' | 'WAITING' | 'DONE';

const COLUMN_STATUSES: Status[]  = ['TODO', 'WORKING', 'WAITING', 'DONE'];

interface CardProps {
    text: string;
    columnIndex: number;
    index: number;
    moveCard: (toColumn: Status, idNum: number) => void;
}

type ProjectSelectResponse = {
    idNum: number;
    projectName: string;
}

type ProjectResponse = {
    idNum: number;
    projectName: string;
    startDate: string;
    endDate: string;
    status: string;
}

type ProjectUserNum = {
    projectIdNum: number;
    projectUserNum: number;
}

type TaskGroupResponse = {
    idNum: number;
    taskGroupName: string;
    projectsIdNum: number;
}

type TaskResponse = {
    idNum: number;
    taskName: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    projectName: string;
    taskGroupIdNum: number;
}

type TaskStatus = {
    idNum: number;
    status: string;
}

interface ColumnProps {
    status: Status;
    tasks: TaskResponse[];
    moveCard: (toColumn: Status, idNum: number) => void;
    searchTerm: string;
    hoverColumn: Status | null;
    setHoverColumn: (status: Status | null) => void;
}

const Column: React.FC<ColumnProps> = ({ status, tasks, moveCard, searchTerm, hoverColumn, setHoverColumn }) => {
    let bgColor = 'transparent';

    switch (status) {
        case 'TODO':
            bgColor = 'rgb(101, 173, 245, 0.1)';
            break;
        case 'WORKING':
            bgColor = 'rgb(108, 181, 111, 0.1)';
            break;
        case 'WAITING':
            bgColor = 'rgb(234, 128, 56, 0.1)';
            break;
        case 'DONE':
            bgColor = 'rgb(50, 65, 122, 0.1)';
            break;
        default:
            break;
    }
    let tasksForStatus: typeof tasks = [];
    if (searchTerm) {
        const tasksForProject = tasks.filter(task => task.projectName === searchTerm);
        tasksForStatus = tasksForProject.filter(task => task.status === status);
        if (status === 'TODO') {
            tasksForStatus.push(...tasksForProject.filter(task => task.status === null));
        }
    } else {
        tasksForStatus = tasks.filter(task => task.status === status);
        if (status === 'TODO') {
            tasksForStatus.push(...tasks.filter(task => task.status === null));
        }
    }

    const [, dropRef] = useDrop({
        accept: ItemType.CARD,
        hover: (item: { columnStatus: Status; idNum: number }) => {
            setHoverColumn(status);
        },
        drop: (item: { columnStatus: Status; idNum: number }) => {
            let fromStatus: Status = item.columnStatus;
            if(item.columnStatus === null) {
                fromStatus = 'TODO';
            }
            const fromColumn = fromStatus;
            const toColumn = status;

            setHoverColumn(null);

            if(fromColumn === toColumn) {
                return;
            }

            moveCard(toColumn, item.idNum);
        }
    });

    // DONE 상태의 컬럼에는 드롭 비활성화
    const assignedDropRef = status !== "DONE" ? dropRef : null;

    return (
        <Grid ref={assignedDropRef} item xs={3} key={status}
              sx={{ width: '100%', height: '100%' }}>
            <Box component={Paper} elevation={3}
                 sx={{
                     m: 1,
                     p: 1,
                     borderRadius: '6px',
                     backgroundColor: hoverColumn === status ? 'someOtherColor' : bgColor,
                     textAlign: 'center',
                     minHeight: '200px',
                     ...hoverColumn === status && { boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)' }  // Add any other style changes here
                 }}>
                <Typography variant="h6">{status}</Typography>
                <Divider sx={{ my: 1 }} />
                {tasksForStatus.length === 0 ? (
                    <Typography variant="body1">업무가 없습니다.</Typography>
                ) : tasksForStatus.map((task, index) => (
                    <React.Fragment key={task.idNum}>
                        <Card {...task} columnIndex={COLUMN_STATUSES.indexOf(status)} index={index} moveCard={moveCard} />
                    </React.Fragment>
                ))}
            </Box>
        </Grid>
    );
}

const Card: React.FC<TaskResponse & CardProps> = ({
                                                      idNum,
                                                      taskName,
                                                      description,
                                                      startDate,
                                                      endDate,
                                                      status,
                                                      projectName,
                                                      taskGroupIdNum,
                                                      columnIndex,
                                                      index,
                                                      moveCard,
                                                  }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const [hasPermission, setHasPermission] = useState<boolean>(false);

    useEffect(() => {
        axios.get(`/api/task/level/${idNum}`)
            .then(response => {
                if(response.data === 1) {
                    setHasPermission(true);
                } else {
                    setHasPermission(false);
                }
            })
            .catch(error => {
                console.error("Error checking permission:", error);
            });
    }, [idNum]);

    const [, drag] = useDrag({
        type: ItemType.CARD,
        item: { columnStatus: status, idNum },
        canDrag: status !== "WAITING" && status !== "DONE", // 드래그가 가능한 조건을 명시
    });

    // `status`가 "DONE"이 아닐 경우에만 drag 핸들러를 연결
    if (status !== "DONE") {
        drag(cardRef);
    }

    return (
        <MUICard ref={cardRef}
                 sx={{
                     m: 1,
                     mb: 2,
                     p: 2,
                     border: 'none',
                     backgroundColor: 'rgb(255, 255, 255, 0.5)',
                     boxShadow: 3,
                     position: 'relative',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'space-between'
                 }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" gutterBottom
                            component={"div"}
                            sx={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                >
                    <Chip
                        label=""
                        sx={{
                            backgroundColor: status === 'TODO' ? green[400] : status === 'WORKING' ? yellow[400] : status === 'WAITING' ? blue[400] : green[400],
                            marginRight: 'auto',
                            width: '40px',
                            height: '10px',
                            fontSize: '0.8rem',
                            padding: '2px 12px'
                        }}
                    />
                    <span style={{fontSize: '12px', color: 'gray', marginLeft: '5px'}} >
                    {startDate} ~ {endDate}
                    </span>
                </Typography>
                {status === 'WAITING' && hasPermission && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                            <Button
                                variant="contained"
                                sx={{
                                    p: 0,
                                    color: 'black',
                                    marginLeft: '5px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    width: '25px',
                                    minWidth: '25px',
                                    height: '20px',
                                    backgroundColor: 'white',
                                    boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important',
                                    textTransform: 'none',
                                    '&:hover': {
                                        textDecoration: 'none',
                                        backgroundColor: 'rgb(0, 0, 0, 0.1)',
                                    },
                                }}
                            >
                                <CheckCircleIcon style={{ color: 'rgb(23, 210, 23)', fontSize: '15px'}} />
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    p: 0,
                                    color: 'black',
                                    marginLeft: '5px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    width: '25px',
                                    minWidth: '25px',
                                    height: '20px',
                                    backgroundColor: 'white',
                                    boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12) !important',
                                    textTransform: 'none',
                                    '&:hover': {
                                        textDecoration: 'none',
                                        backgroundColor: 'rgb(0, 0, 0, 0.1)',
                                    },
                                }}
                            >
                                <CancelIcon style={{ color: 'red', fontSize: '15px'}} />
                            </Button>
                    </Box>
                    )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" gutterBottom
                            sx={{
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}
                >
                    {taskName}
                </Typography>
                {/*<Typography variant="subtitle1" color="textSecondary" gutterBottom>*/}
                {/*    {projectName}*/}
                {/*</Typography>*/}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                <Typography variant="body2" gutterBottom
                            sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                                textAlign: 'left',
                            }}>
                    {description}
                </Typography>
            </Box>
        </MUICard>

    );
};

// column배열 초기상태
const initialColumns: Record<Status, string[]> = {
    'TODO': [],
    'WORKING': [],
    'WAITING': [],
    'DONE': []
};

const Kanban: React.FC = () => {
    const [reloadData, setReloadData] = useState(false);
    const [columns, setColumns] = React.useState<Record<Status, string[]>>(initialColumns);
    const [hoverColumn, setHoverColumn] = useState<Status | null>(null);
    const [projectResponses, setProjectResponses] = useState<ProjectResponse[]>([]);
    const [taskGroupResponses, setTaskGroupResponses] = useState<TaskGroupResponse[]>([]);
    const [taskResponses, setTaskResponses] = useState<TaskResponse[]>([]);
    const [projectUserNum, setProjectUserNum] = useState<ProjectUserNum[]>([]);
    const [options, setOptions] = useState<ProjectSelectResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProjectIdNum, setSelectedProjectIdNum] = useState<number>(0);
    const [isErrorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [projectListOpen, setProjectListOpen] = useState(false);
    const [taskIdNum, setTaskIdNum] = useState<number>(0);
    const [taskStatusModalOpen, setTaskStatusModalOpen] = useState(false);

    const autocompleteOptions = options.map(option => option.projectName);
    const filteredOptions = searchTerm === ""
        ? autocompleteOptions.filter(option =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : autocompleteOptions;

    const moveCard = (
        toColumn: Status,
        idNum: number,
    ) => {
        // taskIdNum과 status를 TaskStatus 형태로 전송
        const taskStatus: TaskStatus = {
            idNum,
            status: toColumn
        }

        // status가 WORKING -> WAITING으로 변경되는 경우 공수관리 데이터 입력 Modal
        if (toColumn === 'WAITING') {
            setTaskIdNum(idNum);
            setTaskStatusModalOpen(true);
        }

        axios.put("/api/task/status", taskStatus)
            .then((response) => {
                if (response.status === 200) {
                    setReloadData(prev => !prev);
                }
            })
            .catch((error) => {
                setErrorModalOpen(true)
                setErrorMessage("업무 상태 변경에 실패했습니다.")
            });
    };

    const handleInputChange = (
        event: SyntheticEvent<Element, Event>,
        newValue: string,
        reason: AutocompleteInputChangeReason
    ) => {
        setSearchTerm(newValue);
        setSelectedProjectIdNum(projectResponses.find(project => project.projectName === newValue)?.idNum || 0);
    };

    // 업무 상태에 따라 업무를 분류하는 함수
    const classifyTasksByStatus = (tasks: TaskResponse[]): typeof initialColumns => {
        const updatedColumns: typeof initialColumns = { ...initialColumns };
        tasks.forEach((task: TaskResponse) => {
            if (task.status in updatedColumns) {
                updatedColumns[task.status].push(task.taskName);
            } else if (task.status === null) {
                updatedColumns.TODO.push(task.taskName);
            }
        });
        return updatedColumns;
    };

    useEffect(() => {
        // 프로목록 불러오기
        axios.get('/api/project')
            .then((response) => {
                setOptions(response.data);
            })
            .catch((error) => {
                setErrorModalOpen(true)
                setErrorMessage("프로젝트 목록을 불러오는데 실패했습니다.")
            });

        const fetchData = async () => {
            try {
                const projectResponse = await axios.get("/api/project");
                setProjectResponses(projectResponse.data);

                // 조회된 project들의 idNum을 통해 taskGroup과 projectUserNum을 조회
                const taskGroupResponses = await Promise.all(projectResponse.data.map(async (project: ProjectResponse) => {
                    const taskGroupResponse = await axios.get(`/api/task/group/${project.idNum}`);
                    return taskGroupResponse.data;
                }));

                setTaskGroupResponses(taskGroupResponses);

                // TODO: projectIdNum 예외처리
                const projectUserNum: ProjectUserNum[] = await Promise.all(projectResponse.data.map(async (project: ProjectResponse) => {
                    const projectUserNum = await axios.get(`/api/project/user/${project.idNum}`);
                    return { projectIdNum: project.idNum, projectUserNum: projectUserNum.data.length };
                }));

                setProjectUserNum(projectUserNum);

                const taskResponse = await axios.get("/api/task");
                setTaskResponses(taskResponse.data);

                // 상태별로 업무를 분류하는 코드
                const updatedColumns = classifyTasksByStatus(taskResponse.data);
                setColumns(updatedColumns);

            } catch (error) {
                setErrorModalOpen(true);
                setErrorMessage("프로젝트 목록을 불러오는데 실패했습니다.");
            }
        };

        fetchData();

    }, [reloadData]);

    useEffect(() => {
        // column에 정의된 업무를 필터링
        const filteredTasks = taskResponses.filter(task => task.projectName === searchTerm);

        // 상태별로 업무를 분류하는 코드
        const updatedColumns = classifyTasksByStatus(filteredTasks);
        setColumns(updatedColumns);

    }, [searchTerm]);

    return (
    <Grid container>
        <Grid item xs={12} md={12}>
            <Box
                component="div"
                sx={{
                    // 부모컴포넌트의 width를 넘지 않는 선에서 최대길이
                    maxWidth: "1450px",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    p: 2,
                }}
            >
                <div className="SearchBox" style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '10px'}}>
                    <Autocomplete
                        options={filteredOptions}
                        value={searchTerm}
                        onInputChange={handleInputChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                variant="outlined"
                                label="프로젝트검색"
                                placeholder="프로젝트명을 입력해주세요"
                                InputProps={{
                                    ...params.InputProps,
                                    style: { fontSize: '14px', backgroundColor: '#fff' }
                                }}
                                InputLabelProps={{
                                    style: { fontSize: '14px' },
                                }}
                            />
                        )}
                        style={{width: '15%' }}
                    />

                    <Tooltip title={projectListOpen ? "프로젝트 목록 접기" : "프로젝트 목록 보기"}>
                        <IconButton
                            onClick={() => setProjectListOpen(!projectListOpen)}
                            sx={{
                                transform: projectListOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.5s",
                            }}
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                    </Tooltip>
                </div>

                <CSSTransition in={projectListOpen} timeout={500} classNames="project-list" unmountOnExit>
                    <div style={{ marginTop: '10px' }}>
                        <Grid container spacing={2}>
                            {
                                projectResponses.map((project) => {
                                    // TODO: 프로젝트별 업무, TODO, WORKING, WAITING, DONE 개수 조회
                                    // projectName과 동일한 task들을 추출
                                    const tasks = taskResponses.filter(task => task.projectName === project.projectName);
                                    const projectNum = projectUserNum.find(projectUserNum => projectUserNum.projectIdNum === project.idNum)?.projectUserNum || 0;
                                    const todoTasks = tasks.filter(task => task.status === "TODO" || null);
                                    const workingTasks = tasks.filter(task => task.status === "WORKING");
                                    const waitingTasks = tasks.filter(task => task.status === "WAITING");
                                    const doneTasks = tasks.filter(task => task.status === "DONE");

                                    return (
                                        <Grid item xs={12} sm={6} md={3} key={project.idNum}>
                                            <MUICard
                                                style={{ marginBottom: '10px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setSearchTerm(project.projectName);
                                                    setSelectedProjectIdNum(project.idNum);
                                                    setProjectListOpen(false);
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom
                                                                component={"div"}
                                                                sx={{
                                                                    fontSize: '18px',
                                                                    fontWeight: 'bold',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center'
                                                                }}>
                                                        <Chip
                                                            label={project.status}
                                                            sx={{
                                                                backgroundColor: project.status === 'TODO' ? red[400] : project.status === 'WORKING' ? yellow[400] : project.status === 'WAITING' ? blue[400] : green[400],
                                                                marginRight: 'auto',
                                                                width: '40px',
                                                                height: '10px',
                                                                fontSize: '0.8rem',
                                                                padding: '2px 12px'
                                                            }}
                                                        />
                                                        <span>
                                                        &nbsp;
                                                    </span>
                                                    </Typography>
                                                    <Typography variant="h6" gutterBottom>
                                                        {project.projectName}
                                                    </Typography>

                                                    <Typography variant="subtitle1">
                                                        {project.startDate} ~ {project.endDate}
                                                    </Typography>

                                                    <Typography variant="body2" mt={1}>
                                                        작업인원: {projectNum}명
                                                    </Typography>

                                                    <Divider style={{ margin: '10px 0' }} />
                                                    <Typography variant="body2">
                                                        업무: {tasks.length}개
                                                    </Typography>

                                                    <Box display="flex" alignItems="center" mt={1}>
                                                        <Chip
                                                            label="••"
                                                            color="default"
                                                            size="small"
                                                            style={{
                                                                backgroundColor: "rgb(101, 173, 245, 0.5)",
                                                                color: "transparent"
                                                            }}
                                                        />
                                                        <Typography variant="body2" style={{ marginLeft: '8px' }}>
                                                            TODO: {todoTasks.length}개
                                                        </Typography>
                                                    </Box>

                                                    <Box display="flex" alignItems="center" mt={1}>
                                                        <Chip
                                                            label="••"
                                                            color="default"
                                                            size="small"
                                                            style={{ backgroundColor: "rgb(108, 181, 111, 0.5)",
                                                                color: "transparent" }}
                                                        />
                                                        <Typography variant="body2" style={{ marginLeft: '8px' }}>
                                                            WORKING: {workingTasks.length}개
                                                        </Typography>
                                                    </Box>

                                                    <Box display="flex" alignItems="center" mt={1}>
                                                        <Chip
                                                            label="••"
                                                            color="default"
                                                            size="small"
                                                            style={{ backgroundColor: "rgb(234, 128, 56, 0.5)",
                                                                color: "transparent" }}
                                                        />
                                                        <Typography variant="body2" style={{ marginLeft: '8px' }}>
                                                            WAITING: {waitingTasks.length}개
                                                        </Typography>
                                                    </Box>

                                                    <Box display="flex" alignItems="center" mt={1}>
                                                        <Chip
                                                            label="••"
                                                            color="default"
                                                            size="small"
                                                            style={{ backgroundColor: "rgb(50, 65, 122, 0.5)",
                                                                color: "transparent" }}
                                                        />
                                                        <Typography variant="body2" style={{ marginLeft: '8px' }}>
                                                            DONE: {doneTasks.length}개
                                                        </Typography>
                                                    </Box>

                                                </CardContent>
                                            </MUICard>
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>
                    </div>
                </CSSTransition>

                <DndProvider backend={HTML5Backend}>
                    <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#fff' }}>
                        {COLUMN_STATUSES.map(status => (
                            <Column status={status} tasks={taskResponses} moveCard={moveCard} searchTerm={searchTerm} hoverColumn={hoverColumn} setHoverColumn={setHoverColumn} />
                        ))}
                    </Box>
                </DndProvider>
            </Box>
        </Grid>

        {/*공수관리  Modal*/}
        <StatusModal open={taskStatusModalOpen} onClose={() => setTaskStatusModalOpen(false)} idNum={taskIdNum} />

        {/*에러 발생 Modal*/}
        <ErrorModal
            open={isErrorModalOpen}
            onClose={() => setErrorModalOpen(false)}
            title="요청 실패"
            description={errorMessage || ""}
        />
    </Grid>
    );
};

export default Kanban;
