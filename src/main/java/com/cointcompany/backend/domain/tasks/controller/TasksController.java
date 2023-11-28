package com.cointcompany.backend.domain.tasks.controller;

import com.cointcompany.backend.common.config.security.jwt.security.UserDetailsImpl;
import com.cointcompany.backend.domain.tasks.dto.TasksDto;
import com.cointcompany.backend.domain.tasks.service.TasksService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "업무", description = "업무 API 명세서")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/task")
//@CrossOrigin
public class TasksController {

    private final TasksService tasksService;
    private final ModelMapper modelMapper;

    @Operation(summary = "업무 전체 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public ResponseEntity<List<TasksDto.GetTaskRes>> getProjects (Authentication authentication) {
        UserDetailsImpl users = (UserDetailsImpl) authentication.getPrincipal();
        List<TasksDto.GetTaskRes> taskResList = tasksService.getTasks(users.getUserId());

        return new ResponseEntity<>(taskResList, HttpStatus.OK);
    }

    @Operation(summary = "업무 상세 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/info/{taskId}")
    public ResponseEntity<TasksDto.GetTaskInfo> getTask (
            @PathVariable Long taskId
    ) {
        TasksDto.GetTaskInfo taskRes = tasksService.getTaskInfo(taskId);

        return new ResponseEntity<>(taskRes, HttpStatus.OK);
    }

    @Operation(summary = "프로젝트 단위 업무 상세 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/{projectId}")
    public ResponseEntity<List<TasksDto.GetTaskRes>> getProject (
            @PathVariable Long projectId
    ) {
        List<TasksDto.GetTaskRes> taskRes = tasksService.getTask(projectId);

        return new ResponseEntity<>(taskRes, HttpStatus.OK);
    }

    @Operation(summary = "그룹 단위 업무 상세 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/taskgroup/{taskGroupId}")
    public ResponseEntity<List<TasksDto.GetGroupTask>> getTaskGroup (
            @PathVariable Long taskGroupId
    ) {
        List<TasksDto.GetGroupTask> taskRes = tasksService.getGroupTask(taskGroupId);

        return new ResponseEntity<>(taskRes, HttpStatus.OK);
    }

    @Operation(summary = "업무 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/{projectId}")
    public ResponseEntity<Long> postTasks (
            @PathVariable Long projectId,
            @RequestBody TasksDto.PostTaskReq postTaskReq
    ) {
        return new ResponseEntity<>(tasksService.saveTasks(postTaskReq, projectId).getIdNum(), HttpStatus.OK);
    }

    @Operation(summary = "업무 사용자 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/user/{projectId}")
    public ResponseEntity<String> postTasksUser (
            @RequestBody List<TasksDto.TaskUserDto> taskUserDtoList
    ) {

        tasksService.saveTaskUser(taskUserDtoList);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 사용자 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/user/{taskId}")
    public ResponseEntity<List<TasksDto.TaskUserDto>> getTasksUser (
            @PathVariable Long taskId
    ) {
        List<TasksDto.TaskUserDto> taskUserResList = tasksService.getTaskUser(taskId);

        return new ResponseEntity<>(taskUserResList, HttpStatus.OK);
    }

    @Operation(summary = "업무 사용자 권한 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/level/{taskId}")
    public ResponseEntity<Integer> getTasksUserLevel (
            Authentication authentication,
            @PathVariable Long taskId
    ) {
        UserDetailsImpl users = (UserDetailsImpl) authentication.getPrincipal();
        log.info("User ID: " + users.getUserId() + ", Task ID: " + taskId);
        Integer level = tasksService.getTaskUserLevel(users.getUserId(), taskId);

        return new ResponseEntity<>(level, HttpStatus.OK);
    }

    @Operation(summary = "업무 공수 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/work/{taskId}")
    public ResponseEntity<String> postTasksWork (
            @PathVariable Long taskId,
            @RequestBody TasksDto.TaskWorkDto taskWorkDto
    ) {

        tasksService.saveTaskWork(taskWorkDto, taskId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 공수 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/work/{taskId}")
    public ResponseEntity<List<TasksDto.TaskWorkDto>> getTasksWork (
            @PathVariable Long taskId
    ) {
        List<TasksDto.TaskWorkDto> taskWorkResList = tasksService.getTaskWork(taskId);

        return new ResponseEntity<>(taskWorkResList, HttpStatus.OK);
    }

    @Operation(summary = "업무 태그 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/tag/{projectId}")
    public ResponseEntity<String> postTasksTag (
            @PathVariable Long projectId,
            @RequestBody List<TasksDto.TaskTagDto> taskTagDtoList
    ) {

        tasksService.saveTaskTag(taskTagDtoList, projectId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 태그 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/tag")
    public ResponseEntity<List<Long>> getTasksTag (
            @RequestParam List<String> tags
    ) {
        List<Long> taskIds = tasksService.getTaskTag(tags);

        return new ResponseEntity<>(taskIds, HttpStatus.OK);
    }

    @Operation(summary = "업무 상태 수정")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @PutMapping("/status")
    public ResponseEntity<String> putTasksStatus (
            @RequestBody TasksDto.TaskStatus taskStatus
    ) {

        tasksService.modifyTaskStatus(taskStatus);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 그룹 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/group")
    public ResponseEntity<String> postTasksGroup (
            @RequestBody TasksDto.TaskGroupPostDto taskGroupDto
            ) {

        tasksService.saveTaskGroup(taskGroupDto);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 그룹 업무 수정")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @PutMapping("/group/task")
    public ResponseEntity<String> putTasksGroupTask (
            @RequestBody Long taskIdNum
    ) {

        TasksDto.TaskGrouping taskGrouping = new TasksDto.TaskGrouping();
        taskGrouping.setIdNum(taskIdNum);
        taskGrouping.setTaskGroupIdNum(null);

        tasksService.modifyTaskGroupTask(taskGrouping);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 그룹 업무 수정")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @PutMapping("/group/{taskGroupIdNum}")
    public ResponseEntity<String> putTasksGroupTask (
            @PathVariable Long taskGroupIdNum,
            @RequestBody Long taskIdNum
    ) {

            TasksDto.TaskGrouping taskGrouping = new TasksDto.TaskGrouping();
            taskGrouping.setIdNum(taskIdNum);
            taskGrouping.setTaskGroupIdNum(taskGroupIdNum);

            tasksService.modifyTaskGroupTask(taskGrouping);

            return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 그룹 수정")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @PutMapping("/group")
    public ResponseEntity<String> putTasksGroup (
            @RequestBody TasksDto.TaskGroupDto taskGroupPutDto
    ) {

        tasksService.modifyTaskGroup(taskGroupPutDto);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 그룹 조회")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/group/{projectId}")
    public ResponseEntity<List<TasksDto.TaskGroupDto>> getTasksGroup (
            @PathVariable Long projectId
    ) {
        List<TasksDto.TaskGroupDto> taskGroupDtoList = tasksService.getTaskGroup(projectId);

        return new ResponseEntity<>(taskGroupDtoList, HttpStatus.OK);
    }

    @Operation(summary = "업무 부서 신규 등록")
    @ApiResponse(responseCode = "200", description = "등록 성공")
    @PostMapping("/department/{projectId}")
    public ResponseEntity<String> postTasksDepartment (
            @RequestBody List<TasksDto.TasksDepartmentDto> tasksDepartmentDtoList
    ) {

        tasksService.saveTaskDepartment(tasksDepartmentDtoList);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 수정")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @PutMapping("/{projectId}")
    public ResponseEntity<String> putTasks (
            @PathVariable Long projectId,
            @RequestBody TasksDto.PostTaskReq postTaskReq
    ) {

        tasksService.modifyTasks(postTaskReq, projectId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }

    @Operation(summary = "업무 삭제")
    @ApiResponse(responseCode = "200", description = "삭제 성공")
    @DeleteMapping("/{projectId}/delete/{taskId}")
    public ResponseEntity<String> deleteUserGroups (
            @PathVariable Long taskId
    ) {

        tasksService.deleteTasks(taskId);

        return new ResponseEntity<>("SUCCESS", HttpStatus.OK);
    }
}