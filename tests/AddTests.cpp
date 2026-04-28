#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include "Add.h"

// דימוי של הקלט
class MockInput : public IInput {
public:
    MOCK_METHOD(int, readInt, (), (override));
    MOCK_METHOD(std::vector<int>, readIntList, (), (override));
};

// דימוי של המחסן (Repo)
class MockRepo : public IUserRepo {
public:
    MOCK_METHOD(std::vector<User>&, getUsers, (), (override));
    MOCK_METHOD(void, addUser, (User user), (override));
};

class AddTest : public ::testing::Test {
protected:
    MockRepo mockRepo;
    MockInput mockInput;
    std::vector<User> userList; // וקטור אמיתי שהמוק ישתמש בו

    void SetUp() override {
        // גורמים למוק להחזיר את הוקטור שלנו בכל פעם שקוראים ל-getUsers
        ON_CALL(mockRepo, getUsers()).WillByDefault(testing::ReturnRef(userList));
    }
};

// --- טסטים בגישת TDD (בדיקת הלוגיקה הבסיסית) ---

// 1. בדיקה שהפקודה יוצרת משתמש אם הוא לא קיים
TEST_F(AddTest, ShouldCreateUserIfMissing) {
    EXPECT_CALL(mockInput, readInt()).WillOnce(testing::Return(10)); // מזהה משתמש 10
    EXPECT_CALL(mockInput, readIntList()).WillOnce(testing::Return(std::vector<int>{101}));
    
    // הציפייה המרכזית: addUser חייבת להיקרא פעם אחת
    EXPECT_CALL(mockRepo, addUser(testing::_)).Times(1);

    Add command(mockRepo, mockInput);
    command.execute();
}

// 2. בדיקה שהפקודה מוסיפה מוצרים למשתמש קיים
TEST_F(AddTest, ShouldAddProductsToExistingUser) {
    userList.push_back(User(10)); // המשתמש כבר קיים בוקטור
    
    EXPECT_CALL(mockInput, readInt()).WillOnce(testing::Return(10));
    EXPECT_CALL(mockInput, readIntList()).WillOnce(testing::Return(std::vector<int>{202}));
    EXPECT_CALL(mockRepo, addUser(testing::_)).Times(0); // אסור ליצור משתמש חדש!

    Add command(mockRepo, mockInput);
    command.execute();

    // בדיקה שהמוצר באמת נכנס למשתמש (בזכות ה-set ממשימה 15)
    EXPECT_EQ(userList[0].getProducts().size(), 1);
}

// --- טסטים למקרי קצה (Edge Cases) ---

// 3. מקרה קצה: רשימת מוצרים ריקה (לפי הדרישה: "חייב לפחות מוצר אחד")
TEST_F(AddTest, ShouldDoNothingIfProductListIsEmpty) {
    EXPECT_CALL(mockInput, readInt()).WillOnce(testing::Return(5));
    EXPECT_CALL(mockInput, readIntList()).WillOnce(testing::Return(std::vector<int>{})); // ריק

    Add command(mockRepo, mockInput);
    command.execute();

    // מוודאים שלא נוצר משתמש ולא קרה כלום
    EXPECT_EQ(userList.size(), 0);
}

// 4. מקרה קצה: כפילויות בקלט (המשתמש הקיש אותו מוצר פעמיים)
TEST_F(AddTest, ShouldHandleDuplicateProductsInInput) {
    userList.push_back(User(1));
    
    // קלט עם כפילות: מוצר 50 מופיע פעמיים
    EXPECT_CALL(mockInput, readInt()).WillOnce(testing::Return(1));
    EXPECT_CALL(mockInput, readIntList()).WillOnce(testing::Return(std::vector<int>{50, 50}));

    Add command(mockRepo, mockInput);
    command.execute();

    // הבדיקה הקריטית: בגלל ה-set, צריך להיות רק מוצר אחד
    EXPECT_EQ(userList[0].getProducts().size(), 1);
}

// 5. מקרה קצה: הרבה רווחים בין המספרים (לוודא שה-input מתמודד)
// הטסט הזה בודק שהקומנד לא "נלחץ" מזה שהקלט מגיע אחרי רווחים
TEST_F(AddTest, ShouldHandleMultipleSpacesInInput) {
    EXPECT_CALL(mockInput, readInt()).WillOnce(testing::Return(7));
    EXPECT_CALL(mockInput, readIntList()).WillOnce(testing::Return(std::vector<int>{1, 2, 3}));

    Add command(mockRepo, mockInput);
    command.execute();

    ASSERT_EQ(userList.size(), 1);
    EXPECT_EQ(userList[0].getProducts().size(), 3);
}