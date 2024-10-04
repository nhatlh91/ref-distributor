package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.bizup.projectbeta.models.entities.User;

import java.util.Optional;

@Transactional
public interface IUserRepo extends JpaRepository<User,Short> {
    Optional<User> findByPhone(String phone);
}
