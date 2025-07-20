package com.example.review.repository.impl;

import com.example.review.domain.Review;
import com.example.review.repository.ReviewRepositoryCustom;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.example.review.domain.QReview.review;

@Repository
@RequiredArgsConstructor
public class ReviewRepositoryCustomImpl implements ReviewRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Review> findByConditions(Long userId, Double minRating) {
        return queryFactory
                .selectFrom(review)
                .where(
                        userIdEq(userId),
                        ratingGoe(minRating)
                )
                .orderBy(review.createdAt.desc())
                .fetch();
    }

    private BooleanExpression userIdEq(Long userId) {
        return userId != null ? review.userId.eq(userId) : null;
    }

    private BooleanExpression ratingGoe(Double minRating) {
        return minRating != null ? review.rating.goe(minRating) : null;
    }
}
