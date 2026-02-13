using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace EMSLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                // Force the application to use its own directory as the working folder
                string appPath = AppDomain.CurrentDomain.BaseDirectory;
                Directory.SetCurrentDirectory(appPath);

                string batFile = Path.Combine(appPath, "APP.bat");

                if (!File.Exists(batFile))
                {
                    MessageBox.Show("Configuration Error: 'APP.bat' was not found in: " + appPath, "EMS Launcher", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // Check for Node Modules to alert user about the initial wait time
                if (!Directory.Exists(Path.Combine(appPath, "node_modules")))
                {
                    MessageBox.Show("First-time initialization starting.\n\nThe system will now download required components in the background. This may take 30-60 seconds.\n\nYour browser will open automatically when ready.", "EMS System Setup", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }

                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = "cmd.exe";
                // Crucial: The triple quotes handle paths with spaces correctly in CMD /C
                startInfo.Arguments = "/c \"\"" + batFile + "\"\"";
                startInfo.WindowStyle = ProcessWindowStyle.Hidden;
                startInfo.CreateNoWindow = true;
                startInfo.UseShellExecute = false;
                startInfo.WorkingDirectory = appPath;

                Process.Start(startInfo);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Launcher Fatal Error: " + ex.Message, "EMS Dashboard Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}