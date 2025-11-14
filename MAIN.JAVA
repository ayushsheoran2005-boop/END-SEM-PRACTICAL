import java.io.*;
import java.util.*;

// ---------- Main Class ----------
public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);

        // ----- Part (a): Sum of integers using autoboxing/unboxing -----
        System.out.println("Enter numbers separated by space:");
        String line = sc.nextLine();
        String[] nums = line.split(" ");
        int sum = 0;
        for(String n : nums) {
            Integer num = Integer.parseInt(n); // autoboxing
            sum += num;                        // unboxing happens here
        }
        System.out.println("Sum = " + sum);

        // ----- Part (b): Serialize & Deserialize Student -----
        Student s = new Student("Ayush", 101, 85.5);
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("student.dat"));
        oos.writeObject(s);
        oos.close();

        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("student.dat"));
        Student s2 = (Student) ois.readObject();
        ois.close();
        System.out.println("\nDeserialized Student: " + s2);

        // ----- Part (c): Menu-based Employee File Handling -----
        String fileName = "employees.dat";
        while(true) {
            System.out.println("\nMenu: 1.Add Employee  2.Display All  3.Exit");
            int choice = sc.nextInt();
            sc.nextLine(); // consume newline

            if(choice == 1) {
                System.out.print("Name: "); String name = sc.nextLine();
                System.out.print("ID: "); String id = sc.nextLine();
                System.out.print("Designation: "); String desig = sc.nextLine();
                System.out.print("Salary: "); double sal = sc.nextDouble();
                sc.nextLine();

                Employee e = new Employee(name, id, desig, sal);

                // Append employee to file
                List<Employee> list = new ArrayList<>();
                File f = new File(fileName);
                if(f.exists()) {
                    try(ObjectInputStream oin = new ObjectInputStream(new FileInputStream(f))) {
                        list = (List<Employee>) oin.readObject();
                    } catch(Exception ex) {}
                }
                list.add(e);
                try(ObjectOutputStream oout = new ObjectOutputStream(new FileOutputStream(f))) {
                    oout.writeObject(list);
                }
            }
            else if(choice == 2) {
                try(ObjectInputStream oin = new ObjectInputStream(new FileInputStream(fileName))) {
                    List<Employee> list = (List<Employee>) oin.readObject();
                    System.out.println("\nEmployees:");
                    for(Employee e : list) System.out.println(e);
                } catch(Exception ex) {
                    System.out.println("No employees found.");
                }
            }
            else if(choice == 3) break;
            else System.out.println("Invalid Choice!");
        }

        sc.close();
        System.out.println("Program exited.");
    }
}

// ---------- Part (b) Student Class ----------
class Student implements Serializable {
    String name;
    int roll;
    double marks;
    Student(String n, int r, double m) { name=n; roll=r; marks=m; }
    public String toString() { return name + " " + roll + " " + marks; }
}

// ---------- Part (c) Employee Class ----------
class Employee implements Serializable {
    String name, id, designation;
    double salary;
    Employee(String n, String i, String d, double s) {
        name=n; id=i; designation=d; salary=s;
    }
    public String toString() {
        return name + " " + id + " " + designation + " " + salary;
    }
}
