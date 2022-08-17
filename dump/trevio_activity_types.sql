insert into trevio.activity_types (id, system_name, name, weight, is_feed, is_notification, is_bell, is_push, is_email, is_sound)
values  (1, 'publication', 'Новая публикация', 0.1, 1, 0, 0, 0, 0, 0),
        (2, 'like', 'Лайк', 0.1, 0, 1, 1, 0, 0, 0),
        (3, 'subscription', 'Подписка', 0.2, 0, 1, 1, 0, 0, 0),
        (4, 'share', 'Поделиться', 0.3, 1, 1, 1, 0, 0, 0);