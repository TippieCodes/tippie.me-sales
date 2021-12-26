ALTER TABLE orders
    ADD FOREIGN KEY (order_shift) REFERENCES shifts(shift_id);
ALTER TABLE orders
    ADD FOREIGN KEY (order_employee) REFERENCES users(user_id);


ALTER TABLE shifts
    MODIFY started_by INT NULL DEFAULT NULL;
ALTER TABLE shifts
    MODIFY ended_by INT NULL DEFAULT NULL;

ALTER TABLE shifts
    ADD FOREIGN KEY (started_by) REFERENCES users(user_id);
ALTER TABLE shifts
    ADD FOREIGN KEY (ended_by) REFERENCES users(user_id);

ALTER TABLE users
    ADD FOREIGN KEY (user_role) REFERENCES roles(role_id) ON DELETE RESTRICT ON UPDATE CASCADE;