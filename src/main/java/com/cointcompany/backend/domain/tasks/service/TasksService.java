package com.cointcompany.backend.domain.tasks.service;

import com.cointcompany.backend.domain.departments.repository.DepartmentsRepository;
import com.cointcompany.backend.domain.projects.entity.ProjectRoles;
import com.cointcompany.backend.domain.projects.repository.ProjectRolesRepository;
import com.cointcompany.backend.domain.projects.repository.ProjectsRepository;
import com.cointcompany.backend.domain.tasks.dto.TasksDto;
import com.cointcompany.backend.domain.tasks.entity.*;
import com.cointcompany.backend.domain.tasks.repository.*;
import com.cointcompany.backend.domain.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class TasksService {

    private final TasksRepository tasksRepository;
    private final ProjectsRepository projectsRepository;
    private final ProjectRolesRepository projectRolesRepository;
    private final TaskUserRepository taskUserRepository;
    private final TaskDepartmentRepository taskDepartmentRepository;
    private final TaskWorkRepository taskWorkRepository;
    private final TaskTagRepository taskTagRepository;
    private final TaskGroupRepository taskGroupRepository;
    private final DepartmentsRepository departmentsRepository;
    private final UsersRepository usersRepository;
    private final ModelMapper modelMapper;


    @Transactional(readOnly = true)
    public List<TasksDto.GetTaskRes> getTasks (Long userId) {

        List<TaskUser> taskUserList = taskUserRepository.findTaskUserByUsers_IdNum(userId);
        for (TaskUser taskUser : taskUserList) {
            log.info("userID = {}", taskUser.getUsers().getIdNum());
            log.info("projectID = {}", taskUser.getTasks().getIdNum());
        }

        List<TasksDto.GetTaskRes> getTaskResList = new ArrayList<>();

        for (TaskUser taskUser : taskUserList) {
            TasksDto.GetTaskRes getTaskRes =
                    new TasksDto.GetTaskRes(tasksRepository.findById(taskUser.getTasks().getIdNum()).orElseThrow());
            getTaskResList.add(getTaskRes);
        }

        return getTaskResList;
    }

    @Transactional(readOnly = true)
    public TasksDto.GetTaskInfo getTaskInfo (Long taskId) {

        TasksDto.GetTaskInfo getTaskRes = new TasksDto.GetTaskInfo(tasksRepository.findById(taskId).orElseThrow());

        return getTaskRes;
    }

    @Transactional(readOnly = true)
    public List<TasksDto.GetTaskRes> getTask(Long projectId) {

        List<TasksDto.GetTaskRes> getTaskResList = new ArrayList<>();

        List<Tasks> tasksList = tasksRepository.findByProjectsIdNum(projectId);

        for (Tasks tasks : tasksList) {
            TasksDto.GetTaskRes getTaskRes = new TasksDto.GetTaskRes(tasks);
            getTaskResList.add(getTaskRes);
        }

        return getTaskResList;
    }
    @Transactional(readOnly = true)
    public List<TasksDto.GetGroupTask> getGroupTask(Long taskGroupId) {

        List<TasksDto.GetGroupTask> getTaskResList = new ArrayList<>();

        List<Tasks> tasksList = tasksRepository.findByTaskGroup_IdNum(taskGroupId);

        for (Tasks tasks : tasksList) {
            TasksDto.GetGroupTask getTaskRes = new TasksDto.GetGroupTask(tasks);
            getTaskResList.add(getTaskRes);
        }

        return getTaskResList;
    }
    @Transactional
    public Tasks saveTasks(TasksDto.PostTaskReq postTaskReq, Long projectId) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate startDate = LocalDate.parse(postTaskReq.getStartDate(), formatter);
        LocalDate endDate = LocalDate.parse(postTaskReq.getEndDate(), formatter);

        Tasks tasks = modelMapper.map(postTaskReq, Tasks.class);
        tasks.setStartDate(startDate);
        tasks.setEndDate(endDate);

        tasks.setProjects(projectsRepository.findById(projectId).orElseThrow());

        return tasksRepository.save(tasks);
    }
    @Transactional
    public String saveTaskUser (List<TasksDto.TaskUserDto> taskUserDtoList) {

        for (TasksDto.TaskUserDto taskUserDto : taskUserDtoList) {
            // ProjectRoles 엔티티 조회
            Long taskRoleIdLong = Long.valueOf(taskUserDto.getTaskRoleId());
            ProjectRoles projectRole = projectRolesRepository.findById(taskRoleIdLong)
                    .orElseThrow(() -> new IllegalArgumentException("ProjectRole not found with ID: " + taskRoleIdLong));

            // 조회한 ProjectRoles 엔티티를 TaskUser 생성에 사용
            TaskUser taskUser = TaskUser.of(
                    projectRole,
                    tasksRepository.findById(taskUserDto.getTaskId()).orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskUserDto.getTaskId())),
                    usersRepository.findById(taskUserDto.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + taskUserDto.getUserId()))
            );
            taskUserRepository.save(taskUser);
        }

        return "SUCCESS";
    }
    @Transactional
    public List<TasksDto.TaskUserDto> getTaskUser(Long taskId) {

        List<TaskUser> taskUserList = taskUserRepository.findTaskUserByTasks_IdNum(taskId);
        List<TasksDto.TaskUserDto> taskUserDtoList = new ArrayList<>();

        for (TaskUser taskUser : taskUserList) {
            ProjectRoles projectRole = taskUser.getTaskRole();
            Integer roleLevel = (projectRole != null) ? projectRole.getRoleLevel() : null;

            TasksDto.TaskUserDto taskUserDto = new TasksDto.TaskUserDto(
                    taskUser.getTasks().getIdNum(),
                    taskUser.getUsers().getIdNum(),
                    roleLevel
            );
            taskUserDtoList.add(taskUserDto);
        }

        return taskUserDtoList;
    }
    @Transactional
    public Integer getTaskUserLevel(Long userId, Long taskId) {
        Optional<TaskUser> optionalTaskUser = taskUserRepository.findByUsers_IdNumAndTasks_IdNum(userId, taskId);

        if (!optionalTaskUser.isPresent()) {
            throw new IllegalArgumentException("주어진 사용자 및 작업에 대한 TaskUser를 찾을 수 없습니다.");
        }

        TaskUser taskUser = optionalTaskUser.get();

        // getTaskRole이 null인지 검사
        if (taskUser.getTaskRole() == null) {
            // 보통 이런 경우는 없지만, 만약에 TaskUser의 TaskRole이 null이라면
            // 평균적으로 level이 가장 낮은 4를 반환
            return 4;
        }

        // getRoleLevel이 null인지 검사
        if (taskUser.getTaskRole().getRoleLevel() == null) {
            return 4;
        }

        return taskUser.getTaskRole().getRoleLevel();
    }
    @Transactional
    public String modifyTaskStatus (TasksDto.TaskStatus taskStatus) {

        Tasks tasks = tasksRepository.findById(taskStatus.getIdNum()).orElseThrow();
        tasks.setStatus(taskStatus.getStatus());

        return "SUCCESS";
    }

    @Transactional
    public TasksDto.TaskWorkDto saveTaskWork(TasksDto.TaskWorkDto taskWorkDto, Long taskId) {

        TaskWork taskWork = TaskWork.of(
                tasksRepository.findById(taskId).orElseThrow(),
                taskWorkDto.getWorkTime(),
                taskWorkDto.getType(),
                taskWorkDto.getDescription()
        );
        taskWorkRepository.save(taskWork);

        return taskWorkDto;
    }

    @Transactional(readOnly = true)
    public List<TasksDto.TaskWorkDto> getTaskWork(Long taskId) {

            List<TaskWork> taskWorkList = taskWorkRepository.findTaskWorkByTask_IdNum(taskId);
            List<TasksDto.TaskWorkDto> taskWorkDtoList = new ArrayList<>();

            for (TaskWork taskWork : taskWorkList) {
                TasksDto.TaskWorkDto taskWorkDto = new TasksDto.TaskWorkDto(
                        taskWork.getIdNum(),
                        taskWork.getWorkTime(),
                        taskWork.getType(),
                        taskWork.getDescription()
                );
                taskWorkDtoList.add(taskWorkDto);
            }

            return taskWorkDtoList;
    }

    @Transactional
    public List<TasksDto.TaskTagDto> saveTaskTag(List<TasksDto.TaskTagDto> taskTagDtoList, Long taskId) {

        // Project의 태그 관리 기능과 동일
        List<TaskTag> existTaskTagList = taskTagRepository.findTaskTagByTask_IdNum(taskId);

        for (TasksDto.TaskTagDto taskTagDto : taskTagDtoList) {
            if (existTaskTagList.stream().noneMatch(taskTag -> taskTag.getTagName().equals(taskTagDto.getTagName()))) {
                TaskTag taskTag = TaskTag.of(
                        tasksRepository.findById(taskId).orElseThrow(),
                        taskTagDto.getTagName()
                );
                taskTagRepository.save(taskTag);
            }
        }

        for (TaskTag taskTag : existTaskTagList) {
            if (taskTagDtoList.stream().noneMatch(taskTagDto -> taskTagDto.getTagName().equals(taskTag.getTagName()))) {
                taskTagRepository.delete(taskTag);
            }
        }

        return taskTagDtoList;
    }
    @Transactional(readOnly = true)
    public List<Long> getTaskTag (List<String> tags) {
        return taskTagRepository.findTaskIdsByTags(tags, (long) tags.size());
    }
    @Transactional
    public String saveTaskGroup(TasksDto.TaskGroupPostDto taskGroupDto) {

        TaskGroup taskGroup = TaskGroup.of(
                taskGroupDto.getTaskGroupName(),
                taskGroupDto.getDescription(),
                projectsRepository.findById(taskGroupDto.getProjectsIdNum()).orElseThrow()
        );
        taskGroupRepository.save(taskGroup);

        return "SUCCESS";
    }
    @Transactional
    public String modifyTaskGroupTask(TasksDto.TaskGrouping taskGrouping) {

        Tasks task = tasksRepository.findById(taskGrouping.getIdNum()).orElseThrow();
        task.setTaskGroup(taskGroupRepository.findById(taskGrouping.getTaskGroupIdNum()).orElseThrow());

        return "SUCCESS";
    }
    @Transactional(readOnly = true)
    public List<TasksDto.TaskGroupDto> getTaskGroup (Long projectId) {
        List<TaskGroup> taskGroupList = taskGroupRepository.findTaskGroupByProjects_IdNum(projectId);
        List<TasksDto.TaskGroupDto> taskGroupDtoList = new ArrayList<>();

        for (TaskGroup taskGroup : taskGroupList) {
            TasksDto.TaskGroupDto taskGroupDto = new TasksDto.TaskGroupDto(taskGroup);
            taskGroupDtoList.add(taskGroupDto);
        }

        return taskGroupDtoList;
    }
    @Transactional
    public String modifyTaskGroup (TasksDto.TaskGroupDto taskGroupPutDtoList) {

        TaskGroup taskGroup = taskGroupRepository.findById(taskGroupPutDtoList.getIdNum()).orElseThrow();
        taskGroup.setTaskGroupName(taskGroupPutDtoList.getTaskGroupName());
        taskGroup.setDescription(taskGroupPutDtoList.getDescription());
        taskGroupRepository.save(taskGroup);

        return "SUCCESS";
    }
    @Transactional
    public String saveTaskDepartment (List<TasksDto.TasksDepartmentDto> tasksDepartmentDtoList) {

        for (TasksDto.TasksDepartmentDto tasksDepartmentDto : tasksDepartmentDtoList) {
            TaskDepartment taskDepartment = TaskDepartment.of(
                    tasksDepartmentDto.getRole(),
                    tasksRepository.findById(tasksDepartmentDto.getTaskId()).orElseThrow(),
                    departmentsRepository.findById(tasksDepartmentDto.getDepartmentId()).orElseThrow()
            );
            taskDepartmentRepository.save(taskDepartment);
        }

        return "SUCCESS";
    }

    @Transactional
    public void modifyTasks (TasksDto.PostTaskReq postTaskReq, Long projectId) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate startDate = LocalDate.parse(postTaskReq.getStartDate(), formatter);
        LocalDate endDate = LocalDate.parse(postTaskReq.getEndDate(), formatter);

        Tasks tasks = modelMapper.map(postTaskReq, Tasks.class);
        tasks.setStartDate(startDate);
        tasks.setEndDate(endDate);

        tasks.setProjects(projectsRepository.findById(projectId).orElseThrow());

        Tasks task = tasksRepository.findById(tasks.getIdNum()).orElseThrow();
        task.setTaskName(tasks.getTaskName());
        task.setDescription(tasks.getDescription());
        task.setStartDate(tasks.getStartDate());
        task.setEndDate(tasks.getEndDate());
        task.setStatus(tasks.getStatus());

    }
    @Transactional
    public void deleteTasks (Long taskId) {

        projectsRepository.deleteById(taskId);

    }
}
