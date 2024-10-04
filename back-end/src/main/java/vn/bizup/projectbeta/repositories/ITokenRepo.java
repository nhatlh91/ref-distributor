package vn.bizup.projectbeta.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.bizup.projectbeta.models.entities.Token;

import java.util.List;
import java.util.Optional;

@Transactional
public interface ITokenRepo extends JpaRepository<Token, Integer> {
    @Query(value = """
            select t from Token t inner join User u\s
            on t.user.userId = u.userId\s
            where u.userId = :id and (t.expired = false or t.revoked = false)\s
            """)
    List<Token> findAllValidTokenByUser(Short id);

    Optional<Token> findByToken(String token);

    @Modifying
    @Query(nativeQuery = true,
            value = "DELETE FROM token WHERE user_id = :id")
    void deleteByUserId(@Param("id") Integer id);

    @Modifying
    @Query(nativeQuery = true,
            value = "DELETE FROM token WHERE expired AND user_id = :id")
    void deleteExpiredTokenByUserId(@Param("id") Short id);
}
