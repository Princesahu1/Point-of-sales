package com.pos.mapper;

import com.pos.dto.UserDTO;
import com.pos.model.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-13T17:39:06+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO.UserDTOBuilder userDTO = UserDTO.builder();

        userDTO.id( user.getId() );
        userDTO.username( user.getUsername() );
        userDTO.role( user.getRole() );
        userDTO.email( user.getEmail() );
        userDTO.approved( user.isApproved() );
        userDTO.approvedAt( user.getApprovedAt() );
        userDTO.rejectionReason( user.getRejectionReason() );
        userDTO.createdAt( user.getCreatedAt() );

        return userDTO.build();
    }

    @Override
    public List<UserDTO> toDTOList(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserDTO> list = new ArrayList<UserDTO>( users.size() );
        for ( User user : users ) {
            list.add( toDTO( user ) );
        }

        return list;
    }
}
