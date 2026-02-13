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
                // Force working directory to the folder where the EXE is located
                string appPath = AppDomain.CurrentDomain.BaseDirectory;
                Directory.SetCurrentDirectory(appPath);

                string batFile = Path.Combine(appPath, "APP.bat");

                if (!File.Exists(batFile))
                {
                    MessageBox.Show("Error: 'APP.bat' is missing from the folder.", "EMS Dashboard Launcher", MessageBoxButtons.OK, MessageBoxIcon.Stop);
                    return;
                }

                // If node_modules is missing, it's the first run. Let's warn the user.
                if (!Directory.Exists(Path.Combine(appPath, "node_modules")))
                {
                    MessageBox.Show("First-time setup starting. The system will download required components in the background. Please wait a moment...", "EMS System Initialization", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }

                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = "cmd.exe";
                // Start the batch file and don't keep the CMD window open
                startInfo.Arguments = "/c \"\"" + batFile + "\"\"";
                startInfo.WindowStyle = ProcessWindowStyle.Hidden;
                startInfo.CreateNoWindow = true;
                startInfo.UseShellExecute = false;
                startInfo.WorkingDirectory = appPath;

                Process.Start(startInfo);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Launcher Error: " + ex.Message, "EMS Dashboard Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}