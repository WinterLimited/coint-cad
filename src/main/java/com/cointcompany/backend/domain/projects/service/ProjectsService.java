package com.cointcompany.backend.domain.projects.service;

import com.cointcompany.backend.domain.departments.repository.DepartmentsRepository;
import com.cointcompany.backend.domain.projects.dto.ProjectsDto;
import com.cointcompany.backend.domain.projects.entity.*;
import com.cointcompany.backend.domain.projects.repository.*;
import com.cointcompany.backend.domain.users.entity.Users;
import com.cointcompany.backend.domain.users.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProjectsService {

    private final ProjectsRepository projectsRepository;
    private final ProjectDepartmentRepository projectDepartmentRepository;
    private final ProjectUserRepository projectUserRepository;
    private final ProjectRolesRepository projectRolesRepository;
    private final ProjectTagRepository projectTagRepository;
    private final DepartmentsRepository departmentsRepository;
    private final UsersRepository usersRepository;


    @Transactional(readOnly = true)
    public List<ProjectsDto.GetProjectRes> getProjects(Long userId) {

        List<ProjectUser> projectUserList = projectUserRepository.findProjectUserByUsers_IdNum(userId);
        List<ProjectsDto.GetProjectRes> getProjectResList = new ArrayList<>();

        for (ProjectUser projectUser : projectUserList) {
            ProjectsDto.GetProjectRes getProjectRes =
                    new ProjectsDto.GetProjectRes(projectsRepository.findById(projectUser.getProjects().getIdNum()).orElseThrow(null));
        }

        return getProjectResList;
    }

    @Transactional(readOnly = true)
    public ProjectsDto.GetProjectRes getProject(Long projectId) {
        // `orElseThrow`에 람다 표현식을 전달하여 `NoSuchElementException` 발생
        ProjectsDto.GetProjectRes getProjectRes = projectsRepository.findById(projectId)
                .map(ProjectsDto.GetProjectRes::new) // findById의 결과를 GetProjectRes 생성자로 매핑
                .orElseThrow(() -> new NoSuchElementException("Project with id " + projectId + " not found"));

        return getProjectRes;
    }

    @Transactional
    public ProjectsDto.GetProjectRes putProjectConfirm(Long projectId, Boolean confirm) {
        Projects projects = projectsRepository.findById(projectId).orElseThrow();
        projects.setConfirm(confirm);
        projectsRepository.save(projects);

        return new ProjectsDto.GetProjectRes(projects);
    }

    @Transactional
    public Projects saveProjects(Projects projects) {

        return projectsRepository.save(projects);
    }
    @Transactional
    public String saveProjectRoles(List<ProjectsDto.ProjectRolesDto> projectRolesDtoList) {

        for (ProjectsDto.ProjectRolesDto projectRolesDto : projectRolesDtoList) {
            ProjectRoles projectRoles = ProjectRoles.of(
                    projectsRepository.findById(projectRolesDto.getProjectId()).orElseThrow(),
                    projectRolesDto.getRoleName(),
                    projectRolesDto.getRoleLevel(),
                    projectRolesDto.getDescription()
            );
            projectRolesRepository.save(projectRoles);
        }

        return "SUCCESS";
    }
    @Transactional
    public List<ProjectsDto.ProjectRolesDto> getProjectRoles(Long projectId) {

        List<ProjectRoles> projectRolesList = projectRolesRepository.findProjectRolesByProject_IdNum(projectId);
        List<ProjectsDto.ProjectRolesDto> projectRolesDtoList = new ArrayList<>();

        for (ProjectRoles projectRoles : projectRolesList) {
            ProjectsDto.ProjectRolesDto projectRolesDto = new ProjectsDto.ProjectRolesDto(
                    projectRoles.getIdNum(),
                    projectRoles.getRoleName(),
                    projectRoles.getRoleLevel(),
                    projectRoles.getDescription()
            );
            projectRolesDtoList.add(projectRolesDto);
        }

        return projectRolesDtoList;
    }

    @Transactional
    public String saveProjectDepartment (List<ProjectsDto.ProjectDepartmentDto> projectDepartmentDtoList) {

        for (ProjectsDto.ProjectDepartmentDto projectDepartmentDto : projectDepartmentDtoList) {
            ProjectDepartment projectDepartment = ProjectDepartment.of(
                    projectDepartmentDto.getRole(),
                    projectsRepository.findById(projectDepartmentDto.getProjectId()).orElseThrow(),
                    departmentsRepository.findById(projectDepartmentDto.getDepartmentId()).orElseThrow()
            );
            projectDepartmentRepository.save(projectDepartment);
        }

        return "SUCCESS";
    }

    @Transactional
    public String saveProjectUser(List<ProjectsDto.ProjectUserDto> projectUserDtoList) {

        List<ProjectUser> projectUsersToSave = new ArrayList<>();

        for (ProjectsDto.ProjectUserDto userDto : projectUserDtoList) {

            // 프로젝트, 사용자, 그리고 프로젝트 역할을 조회합니다.
            Projects project = projectsRepository.findById(userDto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found for ID: " + userDto.getProjectId()));

            Users user = usersRepository.findById(userDto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + userDto.getUserId()));

            // 프론트에서 보낸 roleLevel을 기준으로 ProjectRoles의 idNum을 조회합니다.
            ProjectRoles projectRole = projectRolesRepository.findByRoleLevelAndProjectIdNum(userDto.getProjectRoleId(), userDto.getProjectId())
                    .orElseThrow(() -> new NoSuchElementException("ProjectRole not found for roleLevel: " + userDto.getProjectRoleId()));

            ProjectUser projectUser = ProjectUser.of(projectRole, project, user);
            projectUsersToSave.add(projectUser);
        }

        projectUserRepository.saveAll(projectUsersToSave);

        return "SUCCESS";
    }

    @Transactional
    public List<ProjectsDto.ProjectTagDto> saveProjectTag(List<ProjectsDto.ProjectTagDto> projectTagDtoList, Long projectIdNum) {

        List<ProjectTag> existingTags = projectTagRepository.findProjectTagByProject_IdNum(projectIdNum);

        // 새로운 태그 추가
        for (ProjectsDto.ProjectTagDto projectTagDto : projectTagDtoList) {
            if (existingTags.stream().noneMatch(tag -> tag.getTagName().equals(projectTagDto.getTagName()))) {
                ProjectTag projectTag = ProjectTag.of(
                        projectsRepository.findById(projectIdNum).orElseThrow(),
                        projectTagDto.getTagName()
                );
                projectTagRepository.save(projectTag);
            }
        }

        // 더이상 존재하지 않는 태그 삭제
        for (ProjectTag existingTag : existingTags) {
            if (projectTagDtoList.stream().noneMatch(tag -> tag.getTagName().equals(existingTag.getTagName()))) {
                projectTagRepository.delete(existingTag);
            }
        }

        return projectTagDtoList;
    }

    @Transactional
    public List<Long> getProjectTag(List<String> tags) {
            return projectTagRepository.findProjectIdsByTags(tags, (long) tags.size());
    }

    @Transactional(readOnly = true)
    public List<ProjectsDto.ProjectTagDto> getTagProject(Long projectId) {

        List<ProjectTag> projectTagList = projectTagRepository.findProjectTagByProject_IdNum(projectId);
        List<ProjectsDto.ProjectTagDto> projectTagDtoList = new ArrayList<>();

        for (ProjectTag projectTag : projectTagList) {
            ProjectsDto.ProjectTagDto projectTagDto = new ProjectsDto.ProjectTagDto(
                    projectTag.getIdNum(),
                    projectTag.getTagName()
            );
            projectTagDtoList.add(projectTagDto);
        }

        return projectTagDtoList;
    }

    @Transactional
    public List<ProjectsDto.ProjectUserDto> getProjectUser(Long projectId) {

        List<ProjectUser> projectUserList = projectUserRepository.findProjectUserByProjects_IdNum(projectId);
        List<ProjectsDto.ProjectUserDto> projectUserDtoList = new ArrayList<>();

        for (ProjectUser projectUser : projectUserList) {
            ProjectRoles projectRole = projectUser.getProjectRole();
            Integer roleLevel = (projectRole != null) ? projectRole.getRoleLevel() : null;

            ProjectsDto.ProjectUserDto projectUserDto = new ProjectsDto.ProjectUserDto(
                    projectUser.getProjects().getIdNum(),
                    projectUser.getUsers().getIdNum(),
                    roleLevel
            );
            projectUserDtoList.add(projectUserDto);
        }

        return projectUserDtoList;
    }


    @Transactional
    public void modifyProjects (Projects getProjectRes) {

        Projects projects = projectsRepository.findById(getProjectRes.getIdNum()).orElseThrow();
        projects.setProjectName(getProjectRes.getProjectName());
        projects.setDescription(getProjectRes.getDescription());
        projects.setStartDate(getProjectRes.getStartDate());
        projects.setEndDate(getProjectRes.getEndDate());
        projects.setStatus(getProjectRes.getStatus());

    }
    @Transactional
    public void deleteProjects (Long projectId) {

        projectsRepository.deleteById(projectId);

    }
}
