package sn.hopital.gestion_hopital;

import java.util.*;
public class TransferRequest 
{
    private List<UUID> analyseIds;
    private List<UUID> ordonnanceIds;
    private List<UUID> imageIds;

    public void setAnalyseIds (List<UUID> analyseIds)
    {
        this.analyseIds = analyseIds;
    }

    public List<UUID> getAnalyseIds()
    {
        return analyseIds;
    }

    public void setOrdonnanceIds (List<UUID> ordonnanceIds)
    {
        this.ordonnanceIds = ordonnanceIds;
    }

    public List<UUID> getOrdonnanceIds()
    {
        return ordonnanceIds;
    }

    public void setImageIds (List<UUID> imageIds)
    {
        this.imageIds = imageIds;
    }

    public List<UUID> getImageIds()
    {
        return imageIds;
    }
}
