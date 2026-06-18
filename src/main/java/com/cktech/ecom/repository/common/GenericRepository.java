package com.cktech.ecom.repository.common;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The interface Generic repository.
 * @param <T>  the type parameter
 * @param <ID> the type parameter,
 */
@NoRepositoryBean
public interface GenericRepository<T, ID> extends CrudRepository<T, ID>, JpaSpecificationExecutor<T> {
    @PersistenceContext
    EntityManager entityManager = null;

    /**
     * Find by is deleted list.
     * @param isDeleted the is deleted
     * @param pageable  the pageable
     * @return the list
     */
    List<T> findByIsDeleted(Boolean isDeleted, Pageable pageable);

    /**
     * Find by is deleted list.
     * @param pageable  the pageable
     * @return the list
     */
    List<T> findByIsDeletedFalse(Pageable pageable);

    /**
     * Find by is deleted list.
     * @return the list
     */
    List<T> findByIsDeletedFalse();

    /**
     * Count by is active and is deleted long.
     * @param isDeleted the is deleted
     * @return the long
     */
    Long countByIsDeleted(Boolean isDeleted);

    /**
     * Count by is active and is deleted long.
     * @return the long
     */
    Long countByIsDeletedFalse();


    /**
     * Find by is deleted list.
     * @param isDeleted the is deleted
     * @param isActive  the is active
     * @param pageable  the pageable
     * @return the list
     */
    List<T> findByIsDeletedAndIsActive(Boolean isDeleted, Boolean isActive, Pageable pageable);

    /**
     * Find by is deleted list.
     * @param pageable  the pageable
     * @return the list
     */
    List<T> findByIsDeletedFalseAndIsActiveTrue(Pageable pageable);

    /**
     * Find by is deleted list.
     * @return the list
     */
    List<T> findByIsDeletedFalseAndIsActiveTrue();

    /**
     * Count by is active and is deleted long.
     * @param isDeleted the is deleted
     * @param isActive  the is active
     * @return the long
     */
    Long countByIsDeletedAndIsActive(Boolean isDeleted, Boolean isActive);

    /**
     * Count by is active and is deleted long.
     * @return the long
     */
    Long countByIsDeletedFalseAndIsActiveTrue();


    @Transactional
    default void updateIsDeletedFlag(ID id, boolean isDeleted, String idFieldName) {
        // Dynamically construct the update query
        String queryStr = "UPDATE " + entityManager.getMetamodel().entity(getEntityClass()).getName() +
                " e SET e.isDeleted = :isDeleted WHERE e." + idFieldName + " = :id";
        Query query = entityManager.createQuery(queryStr);
        query.setParameter("isDeleted", isDeleted);
        query.setParameter("id", id);

        query.executeUpdate();
    }

    // Helper method to determine the entity class
    @SuppressWarnings("unchecked")
    private Class<T> getEntityClass() {
        return (Class<T>) getClass().getGenericSuperclass();
    }
}

