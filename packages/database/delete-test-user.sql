DELETE FROM favorites WHERE user_id = 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq';
DELETE FROM item_collections WHERE item_id IN (SELECT id FROM items WHERE user_id = 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq');
DELETE FROM items WHERE user_id = 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq';
DELETE FROM collections WHERE user_id = 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq';
DELETE FROM account WHERE user_id = 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq';
DELETE FROM session WHERE user_id = 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq';
DELETE FROM "user" WHERE id = 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq';
