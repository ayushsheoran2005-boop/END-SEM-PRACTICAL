Project Title

Java Autoboxing, Serialization, and File Handling with Menu-Driven Employee Management

Description

This Java program demonstrates:

Autoboxing and Unboxing – summing integers from user input.

Serialization and Deserialization – storing and retrieving a Student object.

File Handling and Menu-Driven Employee Management – adding and displaying employee records stored in a file.

Program Structure
1. Main Class (Main)

Part (a) – Sum of Integers

Reads integers from the user as a space-separated string.

Converts each string to Integer using Integer.parseInt() (autoboxing).

Sums all integers (unboxing occurs automatically when adding to primitive int).

Displays the sum.

Part (b) – Serialize & Deserialize Student

Creates a Student object.

Serializes it to student.dat.

Reads it back using deserialization.

Prints the deserialized object.

Part (c) – Menu-Based Employee File Handling

Options:

Add Employee – user inputs employee details, which are stored in employees.dat.

Display All – displays all employees stored in the file.

Exit – terminates the program.

Employee data is persisted using serialization.

Handles empty file scenarios gracefully.

2. Student Class

Implements Serializable.

Fields: name (String), roll (int), marks (double).

Constructor to initialize values.

toString() overridden for readable display.

3. Employee Class

Implements Serializable.

Fields: name, id, designation, salary.

Constructor to initialize employee details.

toString() overridden for readable display.

Sample Output
Enter numbers separated by space:
10 20 30 40
Sum = 100

Deserialized Student: Ayush 101 85.5

Menu: 1.Add Employee  2.Display All  3.Exit
1
Name: John
ID: E101
Designation: Manager
Salary: 50000

Menu: 1.Add Employee  2.Display All  3.Exit
2

Employees:
John E101 Manager 50000.0

Menu: 1.Add Employee  2.Display All  3.Exit
3
Program exited.
