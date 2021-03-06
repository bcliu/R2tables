var app = angular.module('RToTablesApp', []);

app.controller('MainController', ['$scope', function ($scope) {
    $scope.rOutput = '';
    /* Array of arrays, each 2nd level element is a cell in the table */
    $scope.parsed = [];
    /* Current column hovered on and that should be highlighted */
    $scope.columnHoveredOn = -1;
    /* Array of booleans: for column i, true == selected, false == not selected */
    $scope.selectedColumns = [];
    
    $scope.loadExample = function () {
        $scope.rOutput = '(Intercept)                  3.059e+05  1.096e+04  27.919  < 2e-16 ***\n' +
                         'Median_household_income      1.624e+00  1.431e-01  11.352  < 2e-16 ***\n' +
                         'Mean_household_income        5.439e+00  1.153e-01  47.175  < 2e-16 ***\n' +
                         'POPULATION                  -5.389e+00  1.601e+00  -3.366 0.000766 ***\n' +
                         'Total_units                  1.293e+01  4.722e+00   2.739 0.006180 ** \n';
        $scope.parseOutput();
    };
    
    $scope.parseOutput = function () {
        if ($scope.rOutput == '') {
            return;
        }
        $scope.parsed = [];
        $scope.selectedColumns = [];
        $scope.columnHoveredOn = -1;
        
        var lines = $scope.rOutput.trim().split('\n');
        
        var maxNumColumns = -1;
        angular.forEach(lines, function (e, i) {
            var trimmed = e.trim();
            if (trimmed == '') {
                /* Ignore empty lines */
                return;
            }
            /* Hack: merge all < with the number after it, in case of < 2e-16 */
            var tokens = trimmed.replace(new RegExp('< ', 'g'), '<').split(/\s+/);
            if (tokens.length > maxNumColumns) {
                maxNumColumns = tokens.length;
            }
            
            $scope.parsed.push(tokens);
        });
        
        
        for (var i = 0; i < maxNumColumns; i++) {
            $scope.selectedColumns.push(false);
        }
    };
    
    $scope.columnHovered = function (idx) {
        $scope.columnHoveredOn = idx;
    };
    
    $scope.columnClicked = function (idx) {
        $scope.selectedColumns[idx] = !$scope.selectedColumns[idx];
    };
    
    $scope.getColumnClass = function (idx) {
        if ($scope.selectedColumns[idx]) {
            return 'bg-primary';
        }
        if ($scope.columnHoveredOn == idx) {
            return 'bg-info';
        }
        return '';
    };
    
    $scope.areColumnsSelected = function () {
        var ret = false;
        angular.forEach($scope.selectedColumns, function (e, i) {
            if (e) {
                ret = true;
            }
        });
        return ret;
    };
    
    $scope.getSelectedColumnText = function () {
        var lines = [];
        angular.forEach($scope.parsed, function (e, i) {
            var line = [];
            angular.forEach($scope.selectedColumns, function (e2, i2) {
                if (e2) {
                    line.push(e[i2]);
                }
            });
            lines.push(line);
        });
        return lines;
    };
    
    $scope.generateHeaders = function (num) {
        var headers = [];
        for (var i = 0; i < num; i++) {
            headers.push("COLUMN.NAME." + (i + 1));
        }
        return headers;
    };
    
    $scope.generateArray = function (str, num) {
        var ret = [];
        for (var i = 0; i < num; i++) {
            ret.push(str);
        }
        return ret;
    };
    
    $scope.getLatex = function () {
        var formattedLines = [];
        var lines = $scope.getSelectedColumnText();
        var numColumns = lines[0].length;
        
        formattedLines.push('\\begin{tabular}{ | ' + $scope.generateArray('c', numColumns).join(' ') + ' | }');
        formattedLines.push('\\hline');
        formattedLines.push('    ' + $scope.generateHeaders(numColumns).join(' & ') + ' \\\\ \\hline');
        
        angular.forEach(lines, function (e, i) {
            var sanitizedStrings = [];
            /* Need to get rid of symbols like _ for LaTeX */
            angular.forEach(e, function (e2, i2) {
                sanitizedStrings.push(e2.replace(new RegExp('_', 'g'), ' '));
            });
            formattedLines.push('    ' + sanitizedStrings.join(' & ') + ' \\\\');
        });
        
        formattedLines.push('\\hline');
        formattedLines.push('\\end{tabular}');
        
        $scope.formatted = formattedLines.join('\n');
    };
    
    $scope.getMarkdown = function () {
        var formattedLines = [];
        var lines = $scope.getSelectedColumnText();
        var numColumns = lines[0].length;
        
        var headers = $scope.generateHeaders(numColumns);
        formattedLines.push('| ' + headers.join(' | ') + '|');
        formattedLines.push('|' + $scope.generateArray('-----', numColumns).join('|') + '|');
        
        angular.forEach(lines, function (e, i) {
            formattedLines.push('| ' + e.join(' | ') + ' |');
        });
        
        $scope.formatted = formattedLines.join('\n');
    };
}]);