import {
    Button,
    Modal,
    Box,
    TextField,
    Typography,
    Table,
    TableBody,
    IconButton,
    Grid,
    TextareaAutosize
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import * as React from "react";
import axios from "../../../redux/axiosConfig";
import ErrorModal from "../../common/ErrorModal";
import SuccessModal from "../../common/SuccessModal";


type Data = {
    projectName: string;
    description: string;
    startDate: string;
    endDate: string;
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
    idNum: number;
}

export default function StatusModal({ open, onClose, idNum }: ModalProps) {
    // Modal의 페이지네이션 구현
    const [data, setData] = useState<Data>({} as Data);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isErrorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState<boolean>(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData(prevData => ({ ...prevData, [event.target.name]: event.target.value }));
    };

    const SuccessClose = () => {
        setSuccessModalOpen(false);
        onClose();
    };

    const handleProjectSave = async () => {
            try {
                const response = await axios.post('/api/project', {
                    projectName: data.projectName,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate,
                });

                // 업무 공수 등록 성공 시, 성공 Modal 띄우고 모든 Modal 닫기
                // 페이지 초기화
                setSuccessModalOpen(true);
            } catch (error) {
                setErrorModalOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage('업무 공수 등록 중 오류가 발생했습니다.');
                }
            }
        }


    return (
            <Modal open={open}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    minWidth: 600,
                    minHeight: '40vh',
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
                        공수관리
                        </span>
                        <IconButton onClick={onClose} size="small" sx={{ padding: '0' }}>
                            <CloseIcon />
                        </IconButton>
                    </Typography>
                        <Box>
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

                                </span>
                                <IconButton onClick={onClose} size="small" sx={{ padding: '0' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Typography>
                            <TextareaAutosize
                                aria-label="프로젝트 상세설명"
                                minRows={4}
                                name="description"
                                placeholder="프로젝트 상세설명을 입력하세요"
                                value={data.description}
                                onChange={handleInputChange}
                                style={{
                                    fontSize: '14px',
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '10px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    resize: 'vertical'
                                }}
                            />

                            <Grid container spacing={2} sx={{mt: 3}}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="프로젝트 시작예정일"
                                        variant="outlined"
                                        type="date"
                                        name="startDate"
                                        value={data.startDate}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputProps={{
                                            style: { fontSize: '14px', backgroundColor: 'transparent' }
                                        }}
                                        InputLabelProps={{
                                            style: { fontSize: '14px' },
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="프로젝트 종료예정일"
                                        variant="outlined"
                                        type="date"
                                        name="endDate"
                                        value={data.endDate}
                                        onChange={handleInputChange}
                                        fullWidth
                                        InputProps={{
                                            style: { fontSize: '14px', backgroundColor: 'transparent' }
                                        }}
                                        InputLabelProps={{
                                            style: { fontSize: '14px' },
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
                            onClick={handleProjectSave}
                        >
                            저장
                        </Button>
                    </Box>

                    {/*성공 Modal*/}
                    <SuccessModal
                        open={isSuccessModalOpen}
                        onClose={SuccessClose}
                        title={""}
                        description={"업무의 공수관리가 정상적으로 등록되었습니다."}
                    />

                    {/*에러 발생 Modal*/}
                    <ErrorModal
                        open={isErrorModalOpen}
                        onClose={() => setErrorModalOpen(false)}
                        title="요청 실패"
                        description={errorMessage || ""}
                    />
                </Box>
            </Modal>
    );
}
