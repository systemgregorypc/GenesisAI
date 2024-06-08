export interface Env {
	DB: D1Database;
}

// export default {
// 	async fetch(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
// 		const insertedUser = await env.DB.prepare('insert into users(name, email) values (?, ?) returning *')
// 			.bind('name', 'email@example.com')
// 			.first<UserRow>();
// 		console.log('insertedUser');
// 		console.log(insertedUser);
// 		const updatedUser = await env.DB.prepare('update users set name = ? where id = ? returning *')
// 			.bind('newname', insertedUser!.id)
// 			.first();
// 		console.log('updatedUser');
// 		console.log(updatedUser);

// 		const users = (await env.DB.prepare('select * from users').all<UserRow>()).results;
// 		console.log('users');
// 		console.log(users);
// 		return new Response(JSON.stringify({ insertedUser, updatedUser, users }));
// 	},
// };

export default {
	async fetch(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const firstItem = await env.DB.prepare('insert into items(name) values(?) returning *').bind('item_1').first<ItemRow>();

		const updatedItem = await env.DB.prepare('update items set name = ? where name = ? returning *')
			.bind('update_name', firstItem!.name)
			.first<ItemRow>();

		const items = (await env.DB.prepare('select * from items').all<ItemRow>()).results;

		return new Response(JSON.stringify({ firstItem, updatedItem, items }));
	},
};
