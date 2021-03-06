
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionController', function ($scope, $state, $rootScope, $ionicHistory, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory) {
   
    $scope.transactions = [];
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.isTransfer = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.currentItem = {
        'accountFrom': '',
        'accountFromId': '',
        'accountTo': '',
        'accountToId': '',
        'amount': '',
        'category': '',
        'date': '',
        'iscleared': false,
        'isrecurring': false,
        'istransfer': false,
        'notes': '',
        'payee': '',
        'photo': '',
        'runningbalance': '',
        'type': '',
        'typedisplay': ''
    };

    // TRANSACTION TYPES
    $scope.transactionTypeList = [
        { text: "Income", value: "income" },
        { text: "Expense", value: "expense" },
        { text: "Transfer", value: "transfer" },
    ];
    $scope.updateTransactionType = function (item) {
        $scope.isTransfer = (item.text.toUpperCase() === "TRANSFER") ? true : false;
    }

    // EDIT / CREATE ACCOUNT    
    if ($stateParams.transactionId === '') {
        $scope.TransactionTitle = "Create Transaction";
    } else {
        // Edit transaction
        $scope.editIndex = $stateParams.transactionId;
        $scope.inEditMode = true;
        AccountsFactory.getTransaction($stateParams.accountId, $stateParams.transactionId).then(function (transaction) {
            var dtTransDate = new Date(transaction.date);
            if (isNaN(dtTransDate)) {
                transaction.date = "";
            } else {
                transaction.date = dtTransDate;
            }
            $scope.currentItem = transaction;
            $scope.isTransfer = $scope.currentItem.istransfer;
        });
        $scope.TransactionTitle = "Edit Transaction";
    }

    // SAVE
    $scope.saveTransaction = function (currentItem) {

        // Format date
        var dtTran = new Date($scope.currentItem.date);
        dtTran = +dtTran;
        $scope.currentItem.date = dtTran;

        // Handle transaction type
        if ($scope.currentItem.typedisplay.toUpperCase() === "TRANSFER" && currentItem.accountToId === $stateParams.accountId) {
            $scope.currentItem.type = 'income';
            $scope.currentItem.istransfer = true;
        } else if ($scope.currentItem.typedisplay.toUpperCase() === "TRANSFER" && currentItem.accountToId !== $stateParams.accountId) {
            $scope.currentItem.type = 'expense';
            $scope.currentItem.istransfer = true;
        } else {
            $scope.currentItem.type = $scope.currentItem.typedisplay;
            $scope.currentItem.istransfer = false;
        }

        if ($scope.inEditMode) {
            // Update
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                }
            };
            var transactionRef = AccountsFactory.getTransactionRef($stateParams.accountId, $stateParams.transactionId);
            transactionRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
        } else {
            // Create
            if (isNaN($scope.currentItem.notes)) {
                $scope.currentItem.notes = "";
            }
            if (isNaN($scope.currentItem.photo)) {
                $scope.currentItem.photo = "";
            }
            $scope.currentItem.type = $scope.currentItem.type.toLowerCase();
            var sync = AccountsFactory.getTransactions($stateParams.accountId);
            sync.$add($scope.currentItem).then(function (newChildRef) {
                $scope.currentItem = {
                    accountid: newChildRef.key()
                };
            });
        }
        $rootScope.hide();
        $scope.currentItem = {};
        $state.go('app.transactionsByDay', { accountId: $stateParams.accountId, accountName: $stateParams.accountName });
    }
})
