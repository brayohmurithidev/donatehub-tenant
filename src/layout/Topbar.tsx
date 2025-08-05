import {useState} from "react";
import CreateCampaignModal from "@/components/CreateCampaignModal";

const Topbar = () => {
  const [open, setOpen] = useState(false);

  const handleCreateCampaign = () => {
    console.log("Create Campaign");
    setOpen(false);
  };
  return (
    <>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 my-3">
        <div>
          <h1 className="text-xl font-bold">NGO DASHBOARD</h1>{" "}
          <p className="text-sm">Manage your campaigns and track your impact</p>
        </div>
        {/*<Button onClick={() => setOpen(true)}>*/}
        {/*  <PlusIcon className="w-5 h-5" />*/}
        {/*  Create Campaign*/}
        {/*</Button>*/}
          <CreateCampaignModal
              isOpen={open}
              setIsOpen={setOpen}
              onSubmit={handleCreateCampaign}
          />
      </div>

    </>
  );
};

export default Topbar;
