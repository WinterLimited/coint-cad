package com.cointcompany.backend.domain.users.dto;

import com.cointcompany.backend.domain.departments.dto.DepartmentsDto;
import com.cointcompany.backend.domain.departments.entity.Departments;
import com.cointcompany.backend.domain.usergroups.dto.UserGroupsDto;
import com.cointcompany.backend.domain.users.entity.Users;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
@Getter
@Setter
public class UsersDto {

    @NoArgsConstructor
    @Data
    public static class GetUsersRes {
        private Long idNum;

        private String loginId;

        private String name;

        private String position;

        private String phone;

        private String email;

        private String regDate;

        private String regUserid;

        private List<DepartmentsDto.GetUserDepartmentRes> getUserDepartmentResList;

        private List<UserGroupsDto.GetUserUserGroupsRes> getUserUserGroupsResList;

        public GetUsersRes (Users users, List<DepartmentsDto.GetUserDepartmentRes> getUserDepartmentResList,
                            List<UserGroupsDto.GetUserUserGroupsRes> getUserUserGroupsResList) {

            this.idNum = users.getIdNum();
            this.loginId = users.getLoginId();
            this.name = users.getName();
            this.position = users.getPosition();
            this.phone = users.getPhone();
            this.email = users.getEmail();
            this.regDate = users.getRegDate().toString();
            this.regUserid = null;
            this.getUserDepartmentResList = getUserDepartmentResList;
            this.getUserUserGroupsResList = getUserUserGroupsResList;
        }
    }
    @NoArgsConstructor
    @Data
    public static class putUsersReq {
        private Long idNum;

        private String loginId;

        private String name;

        private String position;

        private String phone;

        private String email;

        private List<DepartmentsDto.GetUserDepartmentRes> getUserDepartmentResList;

        private List<UserGroupsDto.GetUserUserGroupsRes> getUserUserGroupsResList;

        public putUsersReq (Users users, List<DepartmentsDto.GetUserDepartmentRes> getUserDepartmentResList,
                            List<UserGroupsDto.GetUserUserGroupsRes> getUserUserGroupsResList) {

            this.idNum = users.getIdNum();
            this.loginId = users.getLoginId();
            this.name = users.getName();
            this.position = users.getPosition();
            this.phone = users.getPhone();
            this.email = users.getEmail();
            this.getUserDepartmentResList = getUserDepartmentResList;
            this.getUserUserGroupsResList = getUserUserGroupsResList;
        }
    }

}
