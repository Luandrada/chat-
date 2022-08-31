let users: { id: string, userId: string }[] = []

export const userJoin = (id: string, listing_id: string, userId: string): boolean => {
    let user = users.find(user => user.userId === userId);

    if (user) {
        return false;
    }

    users.push({ id, userId });

    return true;
}

export const userLeft = (id: string) => {
    users = users.filter(user => user.id !== id);
}

export const getUsers = () => users;